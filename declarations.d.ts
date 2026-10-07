declare module 'html2pdf.js' {
    const html2pdf: any;
    export = html2pdf;
  }

declare module 'react-world-flags';

declare module 'crypto-js' {
  const CryptoJS: {
    AES: {
      encrypt(message: string, key: string): { toString(): string };
    };
  };
  export = CryptoJS;
}

declare module '*.css';
  