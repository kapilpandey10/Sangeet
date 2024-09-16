import React, { useEffect } from 'react';

const BannerAd = () => {
  useEffect(() => {
    const script1 = document.createElement('script');
    script1.setAttribute('data-cfasync', 'false');
    script1.type = 'text/javascript';
    script1.innerHTML = `
      (() => {
        var f = 'rCaohdCemzoMraftzhgznriarntdSozmyzttroeSptorriPnegnzisfleidczetzcreejpblOazceelzbzafrourgEiafcnhozcazpwpoldynzigWettnzectrneoactzedTleixhtCNdondeepzpRaezglEmxtphzzadtloibhzCXtGsIr=izfczo>necmaatrzf(id/o<c>u"meennotn):zygazlcpaslildz"l=oeclayltSst o"rkangaelzb_:dtautoabzas"e=tcIrtse mezmgaertfIit<ezmLzMrTeHmroevnenIitzeemdzocNleenaorlzcdzedcaoedhezUeRdIoCNotmnpeornaepnzteznboinnzdyzabltposaizdezveallyztJsSzOeNmzaDraftiezztAnrermauyczoPdrzoymdiosbezzeptaartsSeyIdnatezrnzatvpiigractSotrnzeernrcuocdzeeUmRaINzgUaiTnytB8sAtrnreamyezlsEetteTgizmdeIoyuBttznseemteIlnEtteergvzaSlNztAnrermaeylBEueftfaeerrzcczltenaermTgiamreFotuntezmculceoaDreItnateerrcvzatlnzeMveEshscatgaepCshiadnznlellAzrBortocaedlceaSsytrCehuaqnznreoltzceenlceoSdyerUeRuIqCzormepnoentesnitLztTnyepveEEervroomrezrEzvreennteztEsrirLotrnzeIvmEadgdeazzstensesmieolnESettoareargce';
      })();
    `;
    document.body.appendChild(script1);

    const script2 = document.createElement('script');
    script2.src = '//fortorterrar.com/400/8102620';
    script2.onerror = script2.onload = () => {
      console.log('Ad script loaded or failed');
    };
    document.body.appendChild(script2);

    // Clean up scripts on unmount
    return () => {
      if (script1) document.body.removeChild(script1);
      if (script2) document.body.removeChild(script2);
    };
  }, []);

  return (
    <div style={{ margin: '20px 0', textAlign: 'center' }}>
      <p>Ad Banner</p>
    </div>
  );
};

export default BannerAd;
