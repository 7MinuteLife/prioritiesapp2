import { NextRequest, NextResponse } from 'next/server';
import { serverDb } from '@/lib/firebase/admin';
import { doc, collection, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { userId, values, listName, listId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Create a simpler data structure
    const data = {
      values: {
        column4: {
          values: Array.isArray(values) 
            ? values.map((v: any) => ({
                content: v.content || '',
                id: v.id || `value-${Math.random().toString(36).substring(2, 9)}`,
                isHighlighted: Boolean(v.isHighlighted)
              }))
            : []
        }
      },
      listName: listName || 'Untitled List',
      updatedAt: serverTimestamp()
    };

    // Add createdAt only for new documents
    if (!listId) {
      data.createdAt = serverTimestamp();
    }

    console.log(`API: Saving values to Firestore: ${listId ? 'Updating existing' : 'Creating new'} document`);

    const userRef = doc(serverDb, 'users', userId);
    const priorityListsRef = collection(userRef, 'priorityLists');
    
    let docRef;
    
    if (listId) {
      // Update existing document
      docRef = doc(priorityListsRef, listId);
      await updateDoc(docRef, data);
    } else {
      // Create new document with auto-generated ID
      docRef = doc(priorityListsRef);
      await setDoc(docRef, data);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Values saved successfully',
      listId: docRef.id
    });
  } catch (error: any) {
    console.error('API Error saving values:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save values' },
      { status: 500 }
    );
  }
} 