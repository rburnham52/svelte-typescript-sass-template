import { action } from '@storybook/addon-actions';

import Button2 from '@src/components/button/Button2.svelte';

export default {
  title: 'Button2',
};


export const withSassSource = () => ({
  Component: Button2,
  props: { text: 'Hello Button2' },
  on: { click: action('clicked') },
});
