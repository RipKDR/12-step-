import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const cronType = searchParams.get('type');

  if (!cronType) {
    return NextResponse.json({ 
      error: 'Missing type parameter',
      availableTypes: ['routine-nudges', 'weekly-checkin']
    }, { status: 400 });
  }

  try {
    let response;
    
    if (cronType === 'routine-nudges') {
      response = await fetch(`${process.env.NEXTAUTH_URL}/api/cron/routine-nudges`, {
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        },
      });
    } else if (cronType === 'weekly-checkin') {
      response = await fetch(`${process.env.NEXTAUTH_URL}/api/cron/weekly-checkin`, {
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        },
      });
    } else {
      return NextResponse.json({ 
        error: 'Invalid type parameter',
        availableTypes: ['routine-nudges', 'weekly-checkin']
      }, { status: 400 });
    }

    const result = await response.json();
    
    return NextResponse.json({
      success: true,
      cronType,
      result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error(`Error testing ${cronType} cron:`, error);
    return NextResponse.json({ 
      error: 'Failed to test cron job',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
