import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'You must be logged in to view your roadmaps.' },
        { status: 401 }
      );
    }

    const { data: roadmaps, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch roadmaps database error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve roadmaps.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ roadmaps }, { status: 200 });
  } catch (err: any) {
    console.error('GET roadmaps exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'You must be logged in to save roadmaps.' },
        { status: 401 }
      );
    }

    const { goal, steps } = await req.json();

    if (!goal || typeof goal !== 'string' || !goal.trim()) {
      return NextResponse.json(
        { error: 'Goal is required.' },
        { status: 400 }
      );
    }

    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json(
        { error: 'Roadmap steps are required.' },
        { status: 400 }
      );
    }

    const { data: newRoadmap, error } = await supabase
      .from('roadmaps')
      .insert({
        user_id: session.user.id,
        goal: goal.trim(),
        steps,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Save roadmap database error:', error);
      return NextResponse.json(
        { error: 'Failed to save roadmap to database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ roadmap: newRoadmap }, { status: 200 });
  } catch (err: any) {
    console.error('POST roadmap exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred while saving the roadmap.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'You must be logged in to delete roadmaps.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Roadmap ID is required.' },
        { status: 400 }
      );
    }

    // Verify ownership of the roadmap
    const { data: roadmap, error: findError } = await supabase
      .from('roadmaps')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (findError || !roadmap) {
      return NextResponse.json(
        { error: 'Roadmap not found or access denied.' },
        { status: 404 }
      );
    }

    // Delete the roadmap
    const { error: deleteError } = await supabase
      .from('roadmaps')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete roadmap database error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete roadmap from database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('DELETE roadmap exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
