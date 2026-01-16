import { createSupabaseClient } from "@/lib/supabase";
import { MatchFeedback } from "@/types";

/**
 * Logs the user's choice to the database.
 * This data is crucial for training future ranking models (RankNet).
 */
export const logMatchFeedback = async (feedback: MatchFeedback) => {
  const supabase = createSupabaseClient();
  
  // Fail gracefully if Supabase isn't set up yet
  if (!supabase) {
    console.warn("Feedback Loop: Supabase client not initialized. Data not saved.");
    return;
  }

  const { error } = await supabase
    .from("match_feedback")
    .insert([
      {
        user_id: feedback.userId || null,
        user_vector: feedback.userVector, // Stored as JSONB
        candidates: feedback.candidates,  // Stored as JSONB
        selected_mentor_id: feedback.selectedMentorId,
        created_at: new Date(feedback.timestamp).toISOString(),
      }
    ]);

  if (error) {
    console.error("Error logging match feedback:", error);
  }
};