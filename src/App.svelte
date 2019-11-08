<script>
    import Button from "./components/button/Button.svelte";
    import Button2 from "./components/button/Button2.svelte";

    export let name;
</script>

<style type="text/scss">
    h1 {
        color: purple;
    }
</style>

<h1>Hello {name}!</h1>
<Button text="Hello"/>
<Button2 text="Hello"/>

