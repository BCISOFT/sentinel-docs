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
        'features/auto-prepend-protection',
        'features/security-logs',
      ],
    },
  ],
};

export default sidebars;
