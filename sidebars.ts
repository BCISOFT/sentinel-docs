import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'installation',
    {
      type: 'category',
      label: 'Protection',
      items: [
        {
          type: 'doc',
          id: 'features/threat-detection',
          label: 'Threat Detection',
          className: 'menu-item-pro',
        },
        {
          type: 'doc',
          id: 'features/brute-force-protection',
          label: 'Brute-force Protection',
          className: 'menu-item-pro',
        },
        {
          type: 'doc',
          id: 'features/ddos-protection',
          label: 'DDoS Protection',
          className: 'menu-item-pro',
        },
        {
          type: 'doc',
          id: 'features/auto-prepend-protection',
          label: 'Auto Prepend File',
          className: 'menu-item-pro',
        },
      ],
    },
    {
      type: 'category',
      label: 'Analysis',
      items: [
        'features/vulnerability-scanner',
        {
          type: 'doc',
          id: 'features/integrity-check',
          label: 'File Integrity Check',
          className: 'menu-item-pro',
        },
      ],
    },
    {
      type: 'category',
      label: 'Monitoring',
      items: [
        'features/security-logs',
      ],
    },
  ],
};

export default sidebars;
