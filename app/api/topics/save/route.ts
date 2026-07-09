import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'You must be logged in to save topics.' },
        { status: 401 }
      );
    }

    const { topic, connections } = await req.json();

    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return NextResponse.json(
        { error: 'Topic is required.' },
        { status: 400 }
      );
    }

    if (!connections || !Array.isArray(connections) || connections.length === 0) {
      return NextResponse.json(
        { error: 'Connections are required.' },
        { status: 400 }
      );
    }

    const normalizedTopic = topic.trim();
    const userId = session.user.id;

    // 1. Get or create the topic row
    let topicId: string;

    // We select the topic first
    const { data: existingTopic, error: getTopicError } = await supabase
      .from('topics')
      .select('id')
      .eq('user_id', userId)
      .eq('title', normalizedTopic)
      .maybeSingle();

    if (getTopicError) {
      console.error('Save topic lookup database error:', getTopicError);
      return NextResponse.json(
        { error: 'Failed database check during save.' },
        { status: 500 }
      );
    }

    if (existingTopic) {
      topicId = existingTopic.id;
    } else {
      // Insert new topic
      const { data: newTopic, error: insertTopicError } = await supabase
        .from('topics')
        .insert({
          user_id: userId,
          title: normalizedTopic,
        })
        .select('id')
        .single();

      if (insertTopicError) {
        console.error('Save topic insert database error:', insertTopicError);
        return NextResponse.json(
          { error: 'Failed to save topic query.' },
          { status: 500 }
        );
      }
      topicId = newTopic.id;
    }

    // 2. Query existing connections for this topic
    const { data: existingConnections, error: getConnectionsError } = await supabase
      .from('connections')
      .select('field')
      .eq('topic_id', topicId);

    if (getConnectionsError) {
      console.error('Save connections check database error:', getConnectionsError);
      return NextResponse.json(
        { error: 'Failed to verify existing connections.' },
        { status: 500 }
      );
    }

    const existingFields = new Set(existingConnections?.map((c) => c.field) || []);

    // 3. Filter connections to insert only the new ones
    const connectionsToInsert = connections
      .filter((c: any) => c.field && !existingFields.has(c.field))
      .map((c: any) => ({
        topic_id: topicId,
        field: c.field,
        analogy: c.analogy || '',
        explanation: c.explanation || '',
        fun_fact: c.funFact || c.fun_fact || '',
        emoji: c.emoji || '💡',
      }));

    if (connectionsToInsert.length > 0) {
      const { error: insertConnectionsError } = await supabase
        .from('connections')
        .insert(connectionsToInsert);

      if (insertConnectionsError) {
        console.error('Save connections insert database error:', insertConnectionsError);
        return NextResponse.json(
          { error: 'Failed to save cross-disciplinary connections.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { message: 'Topic and connections saved to Second Brain.', topicId },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Save endpoint exception:', err);
    return NextResponse.json(
      { error: err?.message || 'An unexpected error occurred while saving.' },
      { status: 500 }
    );
  }
}
