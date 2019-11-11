
<button class="warn" on:click={onClick}>
    {`${text} ${label}`}
</button>

<style type="text/scss">
  @import "~@styles/defaults";

  button.warn {
    background-color: $primary-colour2;
    color: $darkest;
  }
</style>

<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { label } from '@src/components/button/ButtonData'
  console.log('Label:', label);
  export let text = '';

  const dispatch = createEventDispatcher();

  function onClick(event) {
    dispatch('click', event)
  }
</script>
