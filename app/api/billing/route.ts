import { NextRequest, NextResponse } from "next/server";
import {
  CostExplorerClient,
  GetCostAndUsageCommand,
  GetCostAndUsageCommandInput,
  Granularity,
} from "@aws-sdk/client-cost-explorer";

export async function POST(req: NextRequest) {
  try {
    const { accessKeyId, secretAccessKey, region, startDate, endDate } =
      await req.json();

    if (!accessKeyId || !secretAccessKey) {
      return NextResponse.json(
        { error: "AWS credentials are required" },
        { status: 400 }
      );
    }

    const client = new CostExplorerClient({
      region: region || "us-east-1",
      credentials: { accessKeyId, secretAccessKey },
    });

    const end = endDate || new Date().toISOString().split("T")[0];
    const startObj = startDate
      ? new Date(startDate)
      : new Date(new Date().setDate(new Date().getDate() - 30));
    const start = startObj.toISOString().split("T")[0];

    const params: GetCostAndUsageCommandInput = {
      TimePeriod: { Start: start, End: end },
      Granularity: Granularity.DAILY,
      Metrics: ["BlendedCost", "UsageQuantity"],
      GroupBy: [{ Type: "DIMENSION", Key: "SERVICE" }],
    };

    const command = new GetCostAndUsageCommand(params);
    const response = await client.send(command);

    const results = response.ResultsByTime || [];

    // Aggregate per service
    const serviceMap: Record<string, number> = {};
    const dailyTotals: { date: string; total: number }[] = [];

    for (const result of results) {
      const date = result.TimePeriod?.Start || "";
      let dayTotal = 0;

      for (const group of result.Groups || []) {
        const service = group.Keys?.[0] || "Unknown";
        const amount = parseFloat(
          group.Metrics?.BlendedCost?.Amount || "0"
        );
        serviceMap[service] = (serviceMap[service] || 0) + amount;
        dayTotal += amount;
      }

      dailyTotals.push({ date, total: parseFloat(dayTotal.toFixed(2)) });
    }

    const services = Object.entries(serviceMap)
      .map(([name, cost]) => ({ name, cost: parseFloat(cost.toFixed(2)) }))
      .sort((a, b) => b.cost - a.cost);

    const totalCost = services.reduce((sum, s) => sum + s.cost, 0);

    return NextResponse.json({
      totalCost: parseFloat(totalCost.toFixed(2)),
      services,
      dailyTotals,
      period: { start, end },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isAuth =
      message.includes("InvalidClientTokenId") ||
      message.includes("credentials") ||
      message.includes("AccessDenied");

    return NextResponse.json(
      {
        error: isAuth
          ? "Invalid AWS credentials. Check your Access Key ID and Secret."
          : `AWS API error: ${message}`,
      },
      { status: isAuth ? 401 : 500 }
    );
  }
}
