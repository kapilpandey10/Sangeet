import { supabase } from '../../supabaseServer'; // Ensure this is configured properly

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method === 'POST') {
    const { email, password, action } = req.body;

    try {
      if (action === 'login') {
        const { data: session, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.error('Login error:', error);
          return res.status(401).json({ error: 'Login failed. Please check your email and password.' });
        }

        // Return session data (tokens) securely
        return res.status(200).json({ session });
      }

      if (action === 'logout') {
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.error('Logout error:', error);
          return res.status(500).json({ error: 'Logout failed. Please try again later.' });
        }

        // Successful logout
        return res.status(200).json({ message: 'Logged out successfully' });
      }

      // Return 400 for unsupported actions
      return res.status(400).json({ error: 'Invalid action. Supported actions are login and logout.' });

    } catch (err) {
      console.error('Unexpected server error:', err);
      return res.status(500).json({ error: 'Internal server error. Please try again later.' });
    }
  }

  // For any method other than POST, return a 405 Method Not Allowed
  res.setHeader('Allow', ['POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
