import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'You must be logged in to view your Second Brain.' },
        { status: 401 }
      );
    }

    const { data: topics, error } = await supabase
      .from('topics')
      .select(`
        id,
        title,
        created_at,
        connections (
          id,
          field,
          analogy,
          explanation,
          fun_fact,
          emoji
        )
      `)
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch saved topics database error:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve saved topics.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ topics }, { status: 200 });
  } catch (err: any) {
    console.error('GET topics exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'You must be logged in to modify your Second Brain.' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Topic ID is required.' },
        { status: 400 }
      );
    }

    // Verify ownership of the topic
    const { data: topic, error: findError } = await supabase
      .from('topics')
      .select('id')
      .eq('id', id)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (findError || !topic) {
      return NextResponse.json(
        { error: 'Topic not found or access denied.' },
        { status: 404 }
      );
    }

    // Delete the topic (connections will automatically cascade delete)
    const { error: deleteError } = await supabase
      .from('topics')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete topic database error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete topic from database.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Topic deleted successfully.' },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('DELETE topic exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
