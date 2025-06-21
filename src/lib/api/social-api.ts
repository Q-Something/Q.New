import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  display_name: string;
  username: string;
  uid: string;
  age: number | null;
  class: string | null;
  education: string | null;
  hobbies: string | null;
  exam_prep: string | null;
  instagram: string | null;
  discord: string | null;
  avatar_url: string | null;
  followers_count: number;
  following_count: number;
  mutual_sparks_count: number;
  is_following?: boolean;
  is_mutual?: boolean;
}

export interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  other_user?: UserProfile;
  last_message?: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
  sender?: UserProfile;
  reply_to?: string | null;
  reply_to_message?: ChatMessage | null;
  reactions?: { emoji: string; users: string[] }[];
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return null;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.user.id)
      .single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    return null;
  }
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

export async function searchUsersByUID(searchTerm: string): Promise<UserProfile[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    const currentUserId = user?.user?.id;

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('uid', `%${searchTerm}%`)
      .neq('id', currentUserId || '')
      .limit(20);

    if (error) throw error;

    // Check if current user is following these profiles
    if (currentUserId && profiles) {
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentUserId)
        .in('following_id', profiles.map(p => p.id));

      const followingIds = new Set(follows?.map(f => f.following_id) || []);

      return profiles.map(profile => ({
        ...profile,
        is_following: followingIds.has(profile.id)
      }));
    }

    return profiles || [];
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

export async function getSmartSuggestions(): Promise<UserProfile[]> {
  try {
    const currentProfile = await getCurrentUserProfile();
    if (!currentProfile) return [];

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentProfile.id)
      .limit(20);

    if (error) throw error;

    // Score profiles based on similarity
    const scoredProfiles = (profiles || []).map(profile => {
      let score = 0;
      
      // Same class
      if (profile.class === currentProfile.class) score += 30;
      
      // Similar age (within 2 years)
      if (profile.age && currentProfile.age) {
        const ageDiff = Math.abs(profile.age - currentProfile.age);
        if (ageDiff <= 2) score += 20;
      }
      
      // Shared hobbies
      if (profile.hobbies && currentProfile.hobbies) {
        const userHobbies = currentProfile.hobbies.split(',').map(h => h.trim().toLowerCase());
        const profileHobbies = profile.hobbies.split(',').map(h => h.trim().toLowerCase());
        const sharedHobbies = userHobbies.filter(h => profileHobbies.includes(h));
        score += sharedHobbies.length * 15;
      }
      
      // Same exam prep
      if (profile.exam_prep === currentProfile.exam_prep && profile.exam_prep) score += 25;

      return { ...profile, score };
    });

    // Now: Determine which are already followed, for the UnSpark button
    let followingIds: Set<string> = new Set();
    if (currentProfile.id && scoredProfiles.length > 0) {
      const { data: follows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', currentProfile.id)
        .in('following_id', scoredProfiles.map(p => p.id));

      followingIds = new Set(follows?.map(f => f.following_id) || []);
    }

    // Append is_following property
    const finalProfiles = scoredProfiles.map((profile) => ({
      ...profile,
      is_following: followingIds.has(profile.id),
    }));

    // Sort by score and return top matches
    return finalProfiles
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  } catch (error) {
    console.error('Error getting smart suggestions:', error);
    throw error;
  }
}

export async function followUser(userId: string): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.user.id,
        following_id: userId
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
}

export async function unfollowUser(userId: string): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.user.id)
      .eq('following_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
}

export async function getFollowing(): Promise<UserProfile[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return [];

    const { data: follows, error } = await supabase
      .from('follows')
      .select(`
        following_id,
        profiles:following_id (*)
      `)
      .eq('follower_id', user.user.id);

    if (error) throw error;

    return follows?.map((f: any) => f.profiles) || [];
  } catch (error) {
    console.error('Error getting following list:', error);
    throw error;
  }
}

export async function getFollowers(): Promise<UserProfile[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return [];

    const { data: follows, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        profiles:follower_id (*)
      `)
      .eq('following_id', user.user.id);

    if (error) throw error;

    return follows?.map((f: any) => f.profiles) || [];
  } catch (error) {
    console.error('Error getting followers list:', error);
    throw error;
  }
}

export async function getChatRooms(): Promise<ChatRoom[]> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return [];

    const { data: rooms, error } = await supabase
      .from('chat_rooms')
      .select('*')
      .or(`user1_id.eq.${user.user.id},user2_id.eq.${user.user.id}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Get other user profiles for each room
    const roomsWithUsers = await Promise.all(
      (rooms || []).map(async (room) => {
        const otherUserId = room.user1_id === user.user.id ? room.user2_id : room.user1_id;
        
        const { data: otherUser } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', otherUserId)
          .single();

        return {
          ...room,
          other_user: otherUser
        };
      })
    );

    return roomsWithUsers;
  } catch (error) {
    console.error('Error getting chat rooms:', error);
    throw error;
  }
}

export async function createOrGetChatRoom(otherUserId: string): Promise<string> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) throw new Error('User not authenticated');

    // Check if room already exists
    const { data: existingRoom } = await supabase
      .from('chat_rooms')
      .select('id')
      .or(`and(user1_id.eq.${user.user.id},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${user.user.id})`)
      .single();

    if (existingRoom) {
      return existingRoom.id;
    }

    // Create new room
    const { data: newRoom, error } = await supabase
      .from('chat_rooms')
      .insert({
        user1_id: user.user.id,
        user2_id: otherUserId
      })
      .select('id')
      .single();

    if (error) throw error;
    return newRoom.id;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
}

export async function sendMessage(
  roomId: string,
  content: string,
  opts?: { replyTo?: ChatMessage | null }
): Promise<void> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) throw new Error('User not authenticated');

    const payload: {
      room_id: string;
      sender_id: string;
      content: string;
      reply_to?: string | null;
    } = {
      room_id: roomId,
      sender_id: user.user.id,
      content,
    };
    
    if (opts?.replyTo && opts.replyTo.id) {
      payload.reply_to = opts.replyTo.id;
    } else {
      payload.reply_to = null;
    }

    const { error } = await supabase
      .from('chat_messages_new')
      .insert(payload);

    if (error) throw error;

    // Update room's last_message_at
    await supabase
      .from('chat_rooms')
      .update({
        updated_at: new Date().toISOString(),
        last_message_at: new Date().toISOString()
      })
      .eq('id', roomId);

    // Broadcast the message for instant updates
    const channel = supabase.channel(`room-${roomId}-realtime`);
    await channel.send({
      type: 'broadcast',
      event: 'message_sent',
      payload: { roomId, senderId: user.user.id }
    });

    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

// --- REACTIONS ---
export async function addReaction(messageId: string, emoji: string): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) throw new Error('User not authenticated');
  // Only one reaction per user per emoji type per message
  // Remove existing then insert (toggle)
  await supabase
    .from("message_reactions")
    .delete()
    .eq("message_id", messageId)
    .eq("user_id", user.user.id)
    .eq("emoji", emoji);

  await supabase
    .from("message_reactions")
    .insert({
      message_id: messageId,
      emoji,
      user_id: user.user.id,
    });
}
export async function getReactionsForRoom(roomId: string): Promise<
  Record<string, { emoji: string; users: string[] }[]>
> {
  // Get all reactions for all messages in the room
  const { data: reacts, error } = await supabase
    .from("message_reactions")
    .select("message_id, emoji, user_id")
    .in("message_id", (
      (await supabase
        .from("chat_messages_new")
        .select("id")
        .eq("room_id", roomId)
      ).data || []
    ).map(m => m.id));

  if (error) {
    console.error("Failed to get message reactions:", error);
    return {};
  }
  const byMsg: Record<string, { emoji: string; users: string[] }[]> = {};
  for (const r of reacts || []) {
    if (!byMsg[r.message_id]) byMsg[r.message_id] = [];
    let em = byMsg[r.message_id].find((e) => e.emoji === r.emoji);
    if (em) {
      em.users.push(r.user_id);
    } else {
      byMsg[r.message_id].push({ emoji: r.emoji, users: [r.user_id] });
    }
  }
  return byMsg;
}

// --- GET MESSAGES (fetch reactions) ---
export async function getMessages(roomId: string): Promise<ChatMessage[]> {
  try {
    const { data: messages, error } = await supabase
      .from('chat_messages_new')
      .select(`
        *,
        profiles:sender_id (display_name, avatar_url, uid)
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Hydrate reply_to_message for each msg that has reply_to
    const messagesWithReplies = await Promise.all((messages || []).map(async (msg: any) => {
      let reply_to_message = null;
      if (msg.reply_to) {
        const { data: parentMsg } = await supabase
          .from('chat_messages_new')
          .select('id, content, sender_id')
          .eq('id', msg.reply_to)
          .single();
        if (parentMsg) {
          const { data: sender } = await supabase
            .from('profiles')
            .select('display_name, avatar_url, uid')
            .eq('id', parentMsg.sender_id)
            .single();
          reply_to_message = { ...parentMsg, sender };
        }
      }
      return {
        ...msg,
        sender: msg.profiles,
        reply_to_message,
      };
    }));

    // Hydrate Reactions
    const reactionsByMsg = await getReactionsForRoom(roomId);
    const withReactions = messagesWithReplies.map((m: any) => ({
      ...m,
      reactions: reactionsByMsg[m.id] || [],
    }));

    return withReactions as ChatMessage[];
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
}

/**
 * Mark all unread messages in a room as read for the current user
 */
/**
 * Mark all unread messages in a room as read for the current user
 * This works like WhatsApp/Instagram where messages are marked as read when the chat is opened
 */
export async function markMessagesAsRead(roomId: string): Promise<void> {
  const { data: user } = await supabase.auth.getUser();
  if (!user?.user) return;
  
  console.log(`Marking messages as read in room ${roomId} for user ${user.user.id}`);
  
  try {
    // First, let's find all unread messages in this room that aren't from the current user
    const { data: unreadMessages, error: fetchError } = await supabase
      .from('chat_messages_new')
      .select('id')
      .eq('room_id', roomId)
      .neq('sender_id', user.user.id)
      .eq('is_read', false);
    
    if (fetchError) {
      console.error('Error fetching unread messages:', fetchError);
      return;
    }
    
    const messageIds = (unreadMessages || []).map(msg => msg.id);
    
    if (messageIds.length === 0) {
      console.log('No unread messages to mark as read');
      return;
    }
    
    console.log(`Marking ${messageIds.length} messages as read`);
    
    // Now update all these messages in a single batch
    const { data: updatedMessages, error: updateError } = await supabase
      .from('chat_messages_new')
      .update({ is_read: true })
      .in('id', messageIds)
      .select();
    
    if (updateError) {
      console.error('Error marking messages as read:', updateError);
      return;
    }
    
    console.log(`Successfully marked ${updatedMessages?.length || 0} messages as read`);
    
    // Notify all clients about the update using a unique channel name
    const channelName = `message-read-${roomId}-${Date.now()}`;
    const channel = supabase.channel(channelName);
    
    // Set up a subscription to handle the broadcast
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Send a broadcast to all clients to refresh their unread counts
        channel.send({
          type: 'broadcast',
          event: 'MESSAGES_READ',
          payload: { 
            roomId, 
            userId: user.user.id,
            messageCount: updatedMessages?.length || 0,
            timestamp: new Date().toISOString()
          }
        }).then(() => {
          console.log('Broadcast sent successfully');
        }).catch(err => {
          console.error('Error sending broadcast:', err);
        }).finally(() => {
          // Clean up the channel after a short delay
          setTimeout(() => {
            try {
              supabase.removeChannel(channel);
            } catch (e) {
              console.error('Error cleaning up channel:', e);
            }
          }, 1000);
        });
      }
    });
    
  } catch (err) {
    console.error('Error in markMessagesAsRead:', err);
  }
}

/**
 * Get unread message count for a specific room
 */
export async function getUnreadMessageCount(roomId: string): Promise<number> {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user?.user) return 0;

    const { count, error } = await supabase
      .from('chat_messages_new')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', roomId)
      .neq('sender_id', user.user.id)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
}