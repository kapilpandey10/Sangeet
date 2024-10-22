import { supabase } from '../../supabaseServer';  // Use server-side Supabase client

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method === 'POST') {
    const { email, password, action } = req.body;

    // Handle login
    if (action === 'login') {
      const { data: session, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // If login fails, return an error
      if (error) {
        return res.status(401).json({ error: error.message });
      }

      // Return session data (tokens)
      return res.status(200).json({ session });
    }

    // Handle logout
    if (action === 'logout') {
      const { error } = await supabase.auth.signOut();

      // If logout fails, return an error
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      // Successful logout
      return res.status(200).json({ message: 'Logged out successfully' });
    }

    // If the action is not login or logout, return a 400 error
    return res.status(400).json({ error: 'Invalid action' });
  }

  // For any method other than POST, return a 405 Method Not Allowed
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
