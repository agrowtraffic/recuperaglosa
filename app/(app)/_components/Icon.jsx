export const Icon = ({ name, size = 20, stroke = 1.8 }) => {
  const common = { width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:stroke,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':true };
  const paths = {
    home:<><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></>,
    folder:<path d="M3 6h6l2 2h10v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>,
    file:<><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h6"/></>,
    alert:<><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></>,
    scale:<><path d="M12 3v18M5 7h14M7 7l-4 7h8zM17 7l-4 7h8z"/></>,
    chart:<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></>,
    settings:<><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7L10.5 2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7z"/></>,
    plus:<path d="M12 5v14M5 12h14"/>, bell:<><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    chevron:<path d="m9 10 3 3 3-3"/>, upload:<><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 20h14"/></>,
    search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    dollar:<><circle cx="12" cy="12" r="9"/><path d="M15 8.5c-.7-.8-1.7-1.2-3-1.2-1.8 0-3 .9-3 2.3 0 3.4 6 1.6 6 5 0 1.4-1.2 2.4-3.2 2.4-1.4 0-2.5-.5-3.3-1.4M12 5v14"/></>,
    whatsapp:<><path d="M20.5 11.8a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.3-4.7a8.5 8.5 0 1 1 16.2-4Z"/><path d="M8.7 8.2c.3 2.5 2.3 4.6 4.8 5.1"/></>,
    download:<><path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 21h16"/></>,
    copy:<><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></>,
    filter:<path d="M3 5h18l-7 8v6l-4 2v-8Z"/>, eye:<><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></>,
    check:<path d="m5 12 4 4L19 6"/>, x:<path d="M6 6l12 12M18 6 6 18"/>,
    user:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    lock:<><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    credit:<><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    clock:<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    menu:<><path d="M3 6h18M3 12h18M3 18h18"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
};
