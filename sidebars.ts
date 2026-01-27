import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'intro',
    'installation',
    {
      type: 'category',
      label: 'Features',
      items: [
        'features/threat-detection',
        'features/vulnerability-scanner',
        {
          type: 'doc',
          id: 'features/integrity-check',
          label: 'File Integrity Check',
          className: 'menu-item-pro',
        },
        'features/auto-prepend-protection',
        'features/security-logs',
      ],
    },
  ],
};

export default sidebars;
