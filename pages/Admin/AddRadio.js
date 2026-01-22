import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  FaBroadcastTower, FaGlobe, FaCity, FaSignal, 
  FaImage, FaPowerOff, FaLayerGroup, FaPlus, FaSearch, FaMagic 
} from 'react-icons/fa';
import styles from './style/AddRadio.module.css';

const AddRadio = () => {
  const [radioName, setRadioName] = useState('');
  const [globalResults, setGlobalResults] = useState([]); // Global API results
  const [streamUrl, setStreamUrl] = useState('');
  const [country, setCountry] = useState('Nepal');
  const [city, setCity] = useState('');
  const [frequency, setFrequency] = useState('');
  const [status, setStatus] = useState('online');
  const [logoFile, setLogoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // 1. Radio-Browser API Integration
  const searchGlobalDirectory = async () => {
    if (radioName.length < 2) return;
    setUploading(true);
    try {
      const response = await fetch(`https://de1.api.radio-browser.info/json/stations/byname/${radioName}`);
      const data = await response.json();
      setGlobalResults(data.slice(0, 5)); // Show top 5 matches
    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setUploading(false);
    }
  };

  const importGlobalStation = (station) => {
    setRadioName(station.name);
    setStreamUrl(station.url_resolved);
    setCountry(station.country);
    setCity(station.state || '');
    setPreviewUrl(station.favicon); // Use their logo URL
    setGlobalResults([]);
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
    try {
      let finalLogoUrl = previewUrl; // Default to API logo if no file uploaded
      
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `radio-logos/${fileName}`;
        await supabase.storage.from('radio').upload(filePath, logoFile);
        const { data: { publicUrl } } = supabase.storage.from('radio').getPublicUrl(filePath);
        finalLogoUrl = publicUrl;
      }

      const { error } = await supabase.from('radio').insert([{
        radioname: radioName,
        stream_url: streamUrl,
        country: country,
        frequency: parseFloat(frequency) || 0,
        logo_url: finalLogoUrl,
        city: city,
        status: status
      }]);

      if (error) throw error;
      setMessage('Global Station Synced to Library');
      setRadioName(''); setStreamUrl(''); setPreviewUrl('');
    } catch (err) {
      setMessage('Error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.studioContainer}>
      {message && <div className={styles.noirToast}>{message}</div>}
      
      <form onSubmit={handleSubmit} className={styles.studioLayout}>
        <aside className={styles.metaPanel}>
          <div className={styles.panelHeader}>
            <FaLayerGroup color="#ff00ff" /> <span>Discovery Studio</span>
          </div>

          <div className={styles.fieldGrid}>
            <div className={styles.fieldBox}>
              <label><FaBroadcastTower /> Search & Import</label>
              <div className={styles.searchRow}>
                <input 
                  type="text" 
                  value={radioName} 
                  onChange={(e) => setRadioName(e.target.value)} 
                  placeholder="Type Station Name..." 
                />
                <button type="button" onClick={searchGlobalDirectory} className={styles.magicBtn}>
                  <FaMagic />
                </button>
              </div>

              {/* API Result List */}
              {globalResults.length > 0 && (
                <ul className={styles.apiResults}>
                  {globalResults.map((s, i) => (
                    <li key={i} onClick={() => importGlobalStation(s)}>
                      <img src={s.favicon || '/logo/logo.webp'} alt="" />
                      <div>
                        <strong>{s.name}</strong>
                        <p>{s.country} • {s.codec}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.fieldBox}><label><FaGlobe /> Country</label><input type="text" value={country} onChange={(e) => setCountry(e.target.value)} /></div>
            <div className={styles.fieldBox}><label><FaCity /> City/State</label><input type="text" value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div className={styles.fieldBox}><label><FaSignal /> Freq</label><input type="number" step="0.1" value={frequency} onChange={(e) => setFrequency(e.target.value)} /></div>
          </div>
        </aside>

        <section className={styles.contentPanel}>
          <div className={styles.monitorArea}>
            <div className={styles.previewFrame}>
              {previewUrl ? <img src={previewUrl} alt="Logo" /> : <div className={styles.emptyLogo}><FaImage size={40} /></div>}
              <div className={styles.statusBadge}>● {status}</div>
            </div>
            <div className={styles.uploadBox}>
               <label className={styles.fileLabel}><FaPlus /> Change Logo<input type="file" onChange={handleFileChange} hidden /></label>
            </div>
          </div>

          <div className={styles.streamArea}>
             <label>Direct Stream Endpoint</label>
             <input type="url" className={styles.noirInput} value={streamUrl} onChange={(e) => setStreamUrl(e.target.value)} required />
             <p className={styles.hint}>Radio-Browser high-quality stream resolved automatically.</p>
          </div>

          <footer className={styles.actionCenter}>
             <button type="submit" className={styles.publishBtn} disabled={uploading}>
               {uploading ? 'Resolving Station...' : 'Add Station to DynaBeat'}
             </button>
          </footer>
        </section>
      </form>
    </div>
  );
};

export default AddRadio;