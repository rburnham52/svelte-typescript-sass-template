
<button class="primary" on:click={onClick}>
    {`${text} ${label}`}
</button>

<style src="./Button2.scss"></style>

<script>
  import { createEventDispatcher } from 'svelte';
  import { label } from './ButtonData'
  console.log('Label:', label);
  export let text = '';

  const dispatch = createEventDispatcher();

  function onClick(event) {
    dispatch('click', event)
  }
</script>
