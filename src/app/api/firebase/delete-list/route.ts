import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/firebase/admin';
import { doc, deleteDoc } from 'firebase/firestore';

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const listId = searchParams.get('listId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!listId) {
      return NextResponse.json(
        { error: 'List ID is required' },
        { status: 400 }
      );
    }

    console.log(`API: Deleting list for user: ${userId}, list: ${listId}`);
    
    const docRef = doc(serverDb, 'users', userId, 'priorityLists', listId);
    await deleteDoc(docRef);
    
    return NextResponse.json({ 
      success: true, 
      message: 'List deleted successfully' 
    });
  } catch (error: any) {
    console.error('API Error deleting list:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete list' },
      { status: 500 }
    );
  }
} 