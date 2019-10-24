import { action } from '@storybook/addon-actions';

import Button from '../src/components/button/Button.svelte';

export default {
  title: 'Button',
};

export const withSassStyleTag = () => ({
  Component: Button,
  props: { text: 'Hello' },
  on: { click: action('clicked') },
});
