import { prisma } from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teachers' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
        { error: 'First name, last name, and phone number are required' },
        { status: 400 }
      );
    }

    // Create the teacher
    const teacher = await prisma.teacher.create({
      data: {
        firstName,
        lastName,
        email: email || null,
        phoneNumber,
        subject: subject || null,
        qualifications: qualifications || null,
        status: status || 'Active',
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
      },
    });

    return NextResponse.json({ teacher }, { status: 201 });
  } catch (error) {
    console.error('Error creating teacher:', error);
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = (error.meta?.target as string[])?.join(', ');
        return NextResponse.json(
          { error: `A teacher with this ${target} already exists.` },
          { status: 409 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Failed to create teacher' },
      { status: 500 }
    );
  }
}
