import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getConversationsList, getConversationChatTurns } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get('id');

  if (conversationId) {
    const turns = await getConversationChatTurns(conversationId);
    return NextResponse.json({ conversationId, turns });
  }

  const list = await getConversationsList();
  return NextResponse.json({ conversations: list });
}
