import { IntegrationCategory } from "./integrationTypes";
import { SiRazorpay, SiGooglemeet, SiJitsi   } from "react-icons/si";
import { BsStripe } from "react-icons/bs";
import { BiLogoZoom } from "react-icons/bi";
import { MdAttachEmail, MdStorage  } from "react-icons/md";
import { FaAws, FaWhatsappSquare } from "react-icons/fa";
import { IoLogoFirebase } from "react-icons/io5";


export const integrationData: IntegrationCategory[] = [
  {
    title: "Payment Gateways",
    description: "Accept online payments and manage subscriptions.",
    columns: 2,
    integrations: [
      {
        id: "razorpay",
        name: "Enable Email/Password Login",
        description: "Process payments, subscriptions and refunds.",
        status: "Published",
        icon: SiRazorpay,
        account: "blackstone_nexus@razorpay",
      },
      {
        id: "stripe",
        name: "Stripe",
        description: "Global payment processing platform.",
        status: "Not Connected",
        icon: BsStripe,
      },
    ],
  },

  {
    title: "Meeting Providers",
    description: "Enable live classes and online meetings.",
    columns: 3,
    integrations: [
      {
        id: "google-meet",
        name: "Google Meet",
        description: "Secure video meetings for live classes.",
        status: "Active",
        icon: SiGooglemeet,
      },
      {
        id: "jitsi",
        name: "Jitsi Meet",
        description: "Open source video conferencing.",
        status: "Active",
        icon: SiJitsi,
      },
      {
        id: "zoom",
        name: "Zoom",
        description: "Enterprise video conferencing.",
        status: "Disabled",
        icon: BiLogoZoom,
      },
    ],
  },

  {
    title: "Email Service",
    description: "Send system emails and notifications.",
    columns: 1,
    integrations: [
      {
        id: "smtp",
        name: "SMTP",
        description: "Send emails using your SMTP server.",
        status: "Connected",
        icon: MdAttachEmail,
        account: "noreply@blackstone.com",
        fullWidth: true,
      },
    ],
  },

  {
    title: "Storage Services",
    description: "Store and manage files securely.",
    columns: 2,
    integrations: [
      {
        id: "aws-s3",
        name: "AWS S3",
        description: "Cloud storage for files and media.",
        status: "Connected",
        icon: FaAws,
        bucket: "blackstone-nexus",
      },
      {
        id: "local-storage",
        name: "Local Storage",
        description: "Store files on application server.",
        status: "Active",
        icon: MdStorage,
        path: "/var/www/blackstone/storage",
      },
    ],
  },

  {
    title: "Communication (Optional)",
    description: "Send notifications and alerts.",
    columns: 2,
    integrations: [
      {
        id: "whatsapp",
        name: "WhatsApp API",
        description: "Send WhatsApp messages and alerts.",
        status: "Not Connected",
        icon: FaWhatsappSquare,
      },
      {
        id: "firebase",
        name: "Firebase Push",
        description: "Send push notifications to mobile apps.",
        status: "Not Connected",
        icon: IoLogoFirebase,
      },
    ],
  },
];