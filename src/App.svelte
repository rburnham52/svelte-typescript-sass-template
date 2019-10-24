<script>
    import Button from "./components/button/Button.svelte";

    export let name;
</script>

<style type="text/scss">
    h1 {
        color: purple;
    }
</style>

<h1>Hello {name}!</h1>
<Button text="Hello"/>

