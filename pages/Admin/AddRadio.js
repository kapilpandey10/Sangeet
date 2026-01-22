import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  FaBroadcastTower, FaGlobe, FaCity, FaSignal, 
  FaImage, FaPowerOff, FaLayerGroup, FaPlus, FaSearch 
} from 'react-icons/fa';
import styles from './style/AddRadio.module.css';

const AddRadio = () => {
  const [radioName, setRadioName] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [streamUrl, setStreamUrl] = useState('');
  const [country, setCountry] = useState('Nepal');
  const [city, setCity] = useState('');
  const [frequency, setFrequency] = useState('');
  const [status, setStatus] = useState('Offline');
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Intelligent Lookup: Standardized to lowercase keys
  const handleRadioNameChange = async (e) => {
    const value = e.target.value;
    setRadioName(value);

    if (value.length > 1) {
      const { data, error } = await supabase
        .from('radio')
        .select('radioname, city, frequency')
        .ilike('radioname', `%${value}%`)
        .limit(5);

      if (!error && data) {
        setSuggestions(data);
      }
    } else {
      setSuggestions([]);
    }
  };

  const selectSuggestion = (station) => {
    setRadioName(station.radioname);
    setCity(station.city || '');
    setFrequency(station.frequency || '');
    setSuggestions([]);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage('');

    try {
      let finalLogoUrl = '';
      
      // 2. Storage Logic
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `radio-logos/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('radio').upload(filePath, logoFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('radio').getPublicUrl(filePath);
        finalLogoUrl = publicUrl;
      }

      // 3. Database Insertion: Fixed column casing
      const { error } = await supabase
        .from('radio')
        .insert([{
          radioname: radioName,
          stream_url: streamUrl,
          country: country,
          frequency: parseFloat(frequency),
          logo_url: finalLogoUrl,
          city: city,
          status: status
        }]);

      if (error) throw error;

      setMessage('Broadcast Station Synced Successfully');
      setRadioName(''); setStreamUrl(''); setCity(''); setFrequency(''); setPreviewUrl(''); setLogoFile(null);
    } catch (err) {
      setMessage('Sync Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.studioContainer}>
      {message && <div className={styles.noirToast}>{message}</div>}
      
      <form onSubmit={handleSubmit} className={styles.studioLayout}>
        {/* STATION INSPECTOR */}
        <aside className={styles.metaPanel}>
          <div className={styles.panelHeader}>
            <FaLayerGroup color="#ff00ff" /> <span>Station Inspector</span>
          </div>

          <div className={styles.fieldGrid}>
            <div className={styles.fieldBox}>
              <label><FaBroadcastTower /> Radio Name</label>
              <div className={styles.searchContainer}>
                <input 
                  type="text" 
                  value={radioName} 
                  onChange={handleRadioNameChange} 
                  placeholder="Type to find existing FM..." 
                  autoComplete="off"
                  required 
                />
                {suggestions.length > 0 && (
                  <ul className={styles.suggestionList}>
                    {suggestions.map((station, index) => (
                      <li key={index} onClick={() => selectSuggestion(station)}>
                        <FaSearch size={10} /> 
                        <strong>{station.radioname}</strong> 
                        <span>{station.city} ({station.frequency} MHz)</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className={styles.fieldBox}><label><FaGlobe /> Country</label><input type="text" value={country} onChange={(e) => setCountry(e.target.value)} required /></div>
            <div className={styles.fieldBox}><label><FaCity /> City</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} required /></div>
            <div className={styles.fieldBox}><label><FaSignal /> Frequency (MHz)</label><input type="number" step="0.1" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="90.5" required /></div>
            <div className={styles.fieldBox}>
              <label><FaPowerOff /> Mode</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}><option value="Offline">Offline</option><option value="Online">Online</option></select>
            </div>
          </div>
        </aside>

        {/* BROADCAST CANVAS */}
        <section className={styles.contentPanel}>
          <div className={styles.monitorArea}>
            <div className={styles.previewFrame}>
              {previewUrl ? <img src={previewUrl} alt="Logo" /> : <div className={styles.emptyLogo}><FaImage size={40} /></div>}
              <div className={styles.statusBadge} style={{ color: status === 'Online' ? '#00ff00' : '#ff4444' }}>● {status}</div>
            </div>
            <div className={styles.uploadBox}>
               <label className={styles.fileLabel}><FaPlus /> {logoFile ? 'Change Branding' : 'Upload Branding'}<input type="file" accept="image/*" onChange={handleFileChange} hidden /></label>
            </div>
          </div>

          <div className={styles.streamArea}>
             <label>Direct Broadcast Stream URL</label>
             <input type="url" className={styles.noirInput} placeholder="https://icecast.provider.com/stream" value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} required />
             <p className={styles.hint}>Ensure the URL is a direct audio stream (MP3/AAC/M3U8).</p>
          </div>

          <footer className={styles.actionCenter}>
             <button type="submit" className={styles.publishBtn} disabled={uploading}>{uploading ? 'Processing Broadcast...' : 'Add Radio Station'}</button>
          </footer>
        </section>
      </form>
    </div>
  );
};

export default AddRadio;