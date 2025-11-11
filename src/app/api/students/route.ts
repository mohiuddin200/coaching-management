import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: {
        level: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
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
      fatherName,
      fatherPhone,
      motherName,
      motherPhone,
      dateOfBirth, 
      address, 
      status, 
      smsEnabled,
      levelId,
      gender,
      bloodGroup,
      nationality,
      religion,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      previousSchool,
      previousClass,
      previousMarks,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation,
      profileImage,
      birthCertificate,
      idProof,
    } = body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phoneNumber || !fatherName || !fatherPhone || !motherName || !motherPhone || !address || !levelId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create the student
    const student = await prisma.student.create({
      data: {
        firstName,
        lastName,
        email,
        phoneNumber,
        fatherName,
        fatherPhone,
        motherName,
        motherPhone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address,
        status: status || 'Active',
        smsEnabled: smsEnabled || false,
        levelId,
        gender: gender || null,
        bloodGroup: bloodGroup || null,
        nationality: nationality || null,
        religion: religion || null,
        streetAddress: streetAddress || null,
        city: city || null,
        state: state || null,
        postalCode: postalCode || null,
        country: country || null,
        previousSchool: previousSchool || null,
        previousClass: previousClass || null,
        previousMarks: previousMarks !== undefined ? parseFloat(previousMarks) : null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        emergencyContactRelation: emergencyContactRelation || null,
        profileImage: profileImage || null,
        birthCertificate: birthCertificate || null,
        idProof: idProof || null,
      },
      include: {
        level: true,
      },
    });

    // If levelId is provided, auto-enroll student in all class sections of that level
    if (levelId) {
      const classSections = await prisma.classSection.findMany({
        where: {
          subject: {
            levelId: levelId,
          },
          status: 'Scheduled',
        },
      });

      if (classSections.length > 0) {
        await prisma.enrollment.createMany({
          data: classSections.map((section) => ({
            studentId: student.id,
            classSectionId: section.id,
            status: 'Active',
          })),
        });
      }
    }

    return NextResponse.json({ student }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    );
  }
}
