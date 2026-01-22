import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  FaBroadcastTower, FaTrashAlt, FaSave, FaSearch, FaLayerGroup, 
  FaGlobe, FaCity, FaSignal, FaPowerOff, FaPlay, FaStop 
} from 'react-icons/fa';
import ConfirmMsg from '../../components/ConfirmMsg';
import styles from './style/ManageRadio.module.css';

const ManageRadio = () => {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editStation, setEditStation] = useState(null);
  const [message, setMessage] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [stationToDelete, setStationToDelete] = useState(null);

  // 1. Fetch all stations using standardized lowercase keys
  useEffect(() => {
    const fetchStations = async () => {
      const { data, error } = await supabase
        .from('radio')
        .select('*')
        .order('radioname', { ascending: true });
      
      if (!error) {
        setStations(data || []);
        setFilteredStations(data || []);
      }
    };
    fetchStations();
  }, []);

  // 2. Search Logic
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = stations.filter(s => 
      s.radioname.toLowerCase().includes(query) || 
      s.city.toLowerCase().includes(query)
    );
    setFilteredStations(filtered);
  };

  // 3. Update Logic
  const handleUpdate = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from('radio')
      .update({
        radioname: editStation.radioname,
        stream_url: editStation.stream_url,
        country: editStation.country,
        city: editStation.city,
        frequency: parseFloat(editStation.frequency),
        status: editStation.status
      })
      .eq('id', editStation.id);

    if (!error) {
      setStations(stations.map(s => s.id === editStation.id ? editStation : s));
      setFilteredStations(filteredStations.map(s => s.id === editStation.id ? editStation : s));
      setMessage(`Station Updated: ${editStation.radioname}`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className={styles.studioContainer}>
      {message && <div className={styles.noirToast}>{message}</div>}
      
      <header className={styles.studioHeader}>
        <div className={styles.searchWrapper}>
          <FaSearch className={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search broadcast library..." 
            className={styles.noirSearch} 
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className={styles.libraryCount}>
          <FaLayerGroup /> <span>{filteredStations.length} Stations Found</span>
        </div>
      </header>

      <div className={styles.studioMain}>
        {/* LEFT: STATION LIST */}
        <aside className={styles.librarySidebar}>
          {filteredStations.map((station) => (
            <div 
              key={station.id} 
              className={`${styles.stationCard} ${editStation?.id === station.id ? styles.cardActive : ''}`}
              onClick={() => setEditStation({ ...station })}
            >
              <img src={station.logo_url || '/logo/logo.webp'} alt="" className={styles.stationThumb} />
              <div className={styles.stationInfo}>
                <h4>{station.radioname}</h4>
                <p>{station.frequency} MHz • {station.city}</p>
                <span className={station.status === 'Online' ? styles.tagOnline : styles.tagOffline}>
                   {station.status}
                </span>
              </div>
            </div>
          ))}
        </aside>

        {/* RIGHT: BROADCAST INSPECTOR */}
        <section className={styles.inspectorPanel}>
          {editStation ? (
            <form className={styles.metaForm} onSubmit={handleUpdate}>
              <div className={styles.inspectorHeader}>
                <h3>Broadcast Inspector</h3>
                <div className={styles.inspectorActions}>
                  {/* Status Toggle Button */}
                  <button 
                    type="button" 
                    className={editStation.status === 'Online' ? styles.btnOnline : styles.btnOffline}
                    onClick={() => setEditStation({
                      ...editStation, 
                      status: editStation.status === 'Online' ? 'Offline' : 'Online'
                    })}
                  >
                    {editStation.status === 'Online' ? <><FaPlay /> Online</> : <><FaStop /> Offline</>}
                  </button>

                  <button type="button" className={styles.btnDelete} onClick={() => { setStationToDelete(editStation); setShowConfirm(true); }}>
                    <FaTrashAlt />
                  </button>
                  <button type="submit" className={styles.btnSave}>Save Changes</button>
                </div>
              </div>

              <div className={styles.scrollFields}>
                <div className={styles.previewArea}>
                   <img src={editStation.logo_url || '/logo/logo.webp'} alt="" className={styles.largeLogo} />
                   <div className={styles.streamStatus}>
                      <label>Signal Integrity</label>
                      <div className={styles.statusIndicator}>
                         <span className={editStation.status === 'Online' ? styles.pulse : ''}></span>
                         Station is currently <strong>{editStation.status}</strong>
                      </div>
                   </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.fieldBox}>
                    <label><FaBroadcastTower /> Station Name</label>
                    <input type="text" value={editStation.radioname} onChange={(e) => setEditStation({...editStation, radioname: e.target.value})} />
                  </div>
                  <div className={styles.fieldBox}>
                    <label><FaSignal /> Frequency (MHz)</label>
                    <input type="number" step="0.1" value={editStation.frequency} onChange={(e) => setEditStation({...editStation, frequency: e.target.value})} />
                  </div>
                  <div className={styles.fieldBox}>
                    <label><FaGlobe /> Country</label>
                    <input type="text" value={editStation.country} onChange={(e) => setEditStation({...editStation, country: e.target.value})} />
                  </div>
                  <div className={styles.fieldBox}>
                    <label><FaCity /> City</label>
                    <input type="text" value={editStation.city} onChange={(e) => setEditStation({...editStation, city: e.target.value})} />
                  </div>
                  <div className={styles.fieldFull}>
                    <label>Broadcast Stream URL</label>
                    <input type="url" value={editStation.stream_url} onChange={(e) => setEditStation({...editStation, stream_url: e.target.value})} />
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className={styles.emptyInspector}>
               <FaBroadcastTower size={50} />
               <p>Select a station from the library to modify</p>
            </div>
          )}
        </section>
      </div>

      {showConfirm && (
        <ConfirmMsg
          show={showConfirm}
          onConfirm={async () => {
             const { error } = await supabase.from('radio').delete().eq('id', stationToDelete.id);
             if (!error) {
               setStations(stations.filter(s => s.id !== stationToDelete.id));
               setFilteredStations(filteredStations.filter(s => s.id !== stationToDelete.id));
               setEditStation(null);
               setShowConfirm(false);
             }
          }}
          onCancel={() => setShowConfirm(false)}
          message={`Permanently remove "${stationToDelete?.radioname}" from broadcast?`}
        />
      )}
    </div>
  );
};

export default ManageRadio;