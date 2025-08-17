import { useEffect } from "react";
import { useRouter } from "next/router";

const MonetagAd = () => {
  const router = useRouter();

  useEffect(() => {
    // Block ads on admin pages
    if (router.pathname.startsWith("/Admin")) return;

    const script = document.createElement("script");
    script.src = "https://kulroakonsu.net/88/tag.min.js";
    script.setAttribute("data-zone", "135948");
    script.async = true;
    script.setAttribute("data-cfasync", "false");

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [router.pathname]);

  return null;
};

export default MonetagAd;
