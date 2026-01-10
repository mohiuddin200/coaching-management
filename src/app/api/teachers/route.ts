import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { requirePageAccess } from "@/lib/permissions/server";

export async function GET(request: Request) {
  try {
    // Require authentication and check page access
    const userContext = await requirePageAccess('/teachers');
    
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get('excludeId');

    const whereClause: {
      isDeleted: boolean;
      organizationId: string;
      id?: {
        not: string;
      };
    } = {
      isDeleted: false, // Filter out soft-deleted records
      organizationId: userContext.organizationId, // Filter by organization
    };

    // Add excludeId filter if provided
    if (excludeId) {
      whereClause.id = {
        not: excludeId
      };
    }

    const teachers = await prisma.teacher.findMany({
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ teachers });
  } catch (error) {
    // Handle permission errors
    if (error instanceof Error && (error.message.includes("Forbidden") || error.message.includes("Unauthorized"))) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("Forbidden") ? 403 : 401 }
      );
    }
    
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Require authentication and check page access
    const userContext = await requirePageAccess('/teachers');
    
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      subject,
      qualifications,
      status,
      gender,
      dateOfBirth,
      nid,
      bloodGroup,
      nationality,
      religion,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      universityName,
      cgpa,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      profileImage,
      idProof,
      cv,
      salary,
      paymentType,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber) {
      return NextResponse.json(
        { error: "First name, last name, and phone number are required" },
        { status: 400 }
      );
    }

    // Create the teacher with organization context
    const teacher = await prisma.teacher.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phoneNumber,
        subject: subject || null,
        qualifications: qualifications || null,
        status: status || "Active",
        gender: gender || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        nid: nid || null,
        bloodGroup: bloodGroup || null,
        nationality: nationality || null,
        religion: religion || null,
        streetAddress: streetAddress || null,
        city: city || null,
        state: state || null,
        postalCode: postalCode || null,
        country: country || null,
        universityName: universityName || null,
        cgpa: cgpa || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        emergencyContactRelation: emergencyContactRelation || null,
        profileImage: profileImage || null,
        idProof: idProof || null,
        cv: cv || null,
        salary: salary || null,
        paymentType: paymentType || null,
        organizationId: userContext.organizationId, // NEW: Link to organization
      },
    });

    return NextResponse.json({ teacher }, { status: 201 });
  } catch (error) {
    // Handle permission errors
    if (error instanceof Error && (error.message.includes("Forbidden") || error.message.includes("Unauthorized"))) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes("Forbidden") ? 403 : 401 }
      );
    }
    
    console.error("Error creating teacher:", error);
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        const target = (error.meta?.target as string[])?.join(", ");
        return NextResponse.json(
          { error: `A teacher with this ${target} already exists.` },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: "Failed to create teacher" },
      { status: 500 }
    );
  }
}
