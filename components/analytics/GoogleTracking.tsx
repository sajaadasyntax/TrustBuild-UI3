"use client"

import Script from "next/script"

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
const tagManagerId = process.env.NEXT_PUBLIC_GTM_ID

export function GoogleTracking() {
  return (
    <>
      {tagManagerId && (
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${tagManagerId}');
            `,
          }}
        />
      )}
      {measurementId && !tagManagerId && (
        <>
          <Script async src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${measurementId}');
              `,
            }}
          />
        </>
      )}
    </>
  )
}