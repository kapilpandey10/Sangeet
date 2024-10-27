import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import styles from './style/AddRadio.module.css';

const AddRadio = () => {
  const [radioName, setRadioName] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [frequency, setFrequency] = useState('');
  const [status, setStatus] = useState('Offline');
  const [logoFile, setLogoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const addRadioStation = async (logoUrl) => {
    try {
      const parsedFrequency = parseFloat(frequency);

      // Log data for debugging
      console.log('Inserting Data:', {
        RadioName: radioName,
        Stream_url: streamUrl,
        Country: country,
        Frequency: parsedFrequency,
        logo_url: logoUrl,
        city: city,
        status: status,
      });

      // Insert data into the database
      const { data, error } = await supabase
        .from('radio')
        .insert([
          {
            RadioName: radioName,       // Ensure exact case match
          Stream_url: streamUrl,      // Ensure exact case match
          Country: country,           // Ensure exact case match
          Frequency: parseFloat(frequency),
          logo_url: logoUrl,          // Ensure exact case match
          city: city,                 // Ensure exact case match
          status: status,  
          },
        ]);

      if (error) {
        console.error('Insert Error:', error);
        throw new Error('Failed to add radio station. Please check the table schema.');
      }

      setSuccessMessage('Radio station added successfully!');
    } catch (err) {
      console.error('Unexpected error:', err);
      setErrorMessage(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      // Handle logo file upload
      let logoUrl = '';
      if (logoFile) {
        const { data, error } = await supabase.storage
          .from('radio')
          .upload(`radio-logo/${logoFile.name}`, logoFile);

        if (error) {
          console.error('Upload Error:', error);
          throw new Error('Failed to upload logo. Please check bucket permissions and settings.');
        }

        const { publicUrl, error: urlError } = supabase.storage
          .from('radio')
          .getPublicUrl(data.path);

        if (urlError) {
          console.error('Public URL Error:', urlError);
          throw new Error('Failed to get public URL of logo');
        }

        logoUrl = publicUrl;
        console.log('Public URL of uploaded image:', logoUrl);
      }

      await addRadioStation(logoUrl);

      // Reset form
      setRadioName('');
      setStreamUrl('');
      setCountry('');
      setCity('');
      setFrequency('');
      setStatus('Offline');
      setLogoFile(null);
    } catch (err) {
      console.error('Form Submission Error:', err);
      setErrorMessage(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    setLogoFile(e.target.files[0]);
  };

  return (
    <div className={styles.addRadioContainer}>
      <h2 className={styles.header}>Add a New Radio Station</h2>
      <form onSubmit={handleSubmit} className={styles.addRadioForm}>
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        {successMessage && <p className={styles.successMessage}>{successMessage}</p>}

        <label htmlFor="radioName" className={styles.label}>Radio Name</label>
        <input
          id="radioName"
          type="text"
          value={radioName}
          onChange={(e) => setRadioName(e.target.value)}
          required
          placeholder="Enter the radio name"
          className={styles.inputField}
        />

        <label htmlFor="streamUrl" className={styles.label}>Stream URL</label>
        <input
          id="streamUrl"
          type="url"
          value={streamUrl}
          onChange={(e) => setStreamUrl(e.target.value)}
          required
          placeholder="Enter the stream URL"
          className={styles.inputField}
        />

        <label htmlFor="country" className={styles.label}>Country</label>
        <input
          id="country"
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
          placeholder="Enter the country"
          className={styles.inputField}
        />

        <label htmlFor="city" className={styles.label}>City</label>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          placeholder="Enter the city"
          className={styles.inputField}
        />

        <label htmlFor="frequency" className={styles.label}>Frequency (MHz)</label>
        <input
          id="frequency"
          type="number"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          step="0.1"
          min="80"
          max="110"
          required
          placeholder="Enter the frequency"
          className={styles.inputField}
        />

        <label htmlFor="status" className={styles.label}>Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          required
          className={styles.selectField}
        >
          <option value="Offline">Offline</option>
          <option value="Online">Online</option>
        </select>

        <label htmlFor="logoFile" className={styles.label}>Upload Logo</label>
        <input
          id="logoFile"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.inputField}
        />

        <button type="submit" disabled={uploading} className={styles.submitButton}>
          {uploading ? 'Uploading...' : 'Add Radio Station'}
        </button>
      </form>
    </div>
  );
};

export default AddRadio;
