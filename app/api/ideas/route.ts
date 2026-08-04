import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'You must be logged in to view your saved ideas.' },
        { status: 401 }
      );
    }

    const { data: ideas, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch ideas database error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve saved ideas.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ ideas }, { status: 200 });
  } catch (err: any) {
    console.error('GET ideas exception:', err);
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
        { error: 'You must be logged in to save ideas.' },
        { status: 401 }
      );
    }

    const { title, description, why_non_obvious, combined_topics } = await req.json();

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required.' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json(
        { error: 'Description is required.' },
        { status: 400 }
      );
    }

    if (!why_non_obvious || typeof why_non_obvious !== 'string' || !why_non_obvious.trim()) {
      return NextResponse.json(
        { error: 'Mechanism justification (why non-obvious) is required.' },
        { status: 400 }
      );
    }

    if (!combined_topics || !Array.isArray(combined_topics) || combined_topics.length === 0) {
      return NextResponse.json(
        { error: 'Combined topics list is required.' },
        { status: 400 }
      );
    }

    const { data: newIdea, error } = await supabase
      .from('ideas')
      .insert({
        user_id: session.user.id,
        title: title.trim(),
        description: description.trim(),
        why_non_obvious: why_non_obvious.trim(),
        combined_topics,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Save idea database error:', error);
      return NextResponse.json(
        { error: 'Failed to save idea to database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ idea: newIdea }, { status: 200 });
  } catch (err: any) {
    console.error('POST idea exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred while saving the idea.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'You must be logged in to delete ideas.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Idea ID is required.' },
        { status: 400 }
      );
    }

    // Verify ownership of the idea
    const { data: idea, error: findError } = await supabase
      .from('ideas')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (findError || !idea) {
      return NextResponse.json(
        { error: 'Idea not found or access denied.' },
        { status: 404 }
      );
    }

    // Delete the idea
    const { error: deleteError } = await supabase
      .from('ideas')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete idea database error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete idea from database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('DELETE idea exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
