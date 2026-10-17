import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import ServiceCategoryModel from "../../../../models/ServiceCategory";

export async function GET(req: NextRequest) {
    try {
        const title = req.nextUrl.searchParams.get("name");
        if (!title) {
            return NextResponse.json(
                { success: false, message: "Service name is required" },
                { status: 400 }
            );
        }
        let serviceName = title.split("-").map((item: any) => item[0].toUpperCase() + item.slice(1)).join(" ");
        await connectToDatabase();
        const categories = await ServiceCategoryModel.findOne({ name: serviceName })
        return NextResponse.json(categories, { status: 200 })

    } catch (error) {
        return NextResponse.json({ message: `get Service List error ${error}` }, { status: 500 })
    }
}