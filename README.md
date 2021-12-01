# SiteClue Tracker script

## Embedding on website

### Automatic init

```html
<script async defer src="siteclue-tracker.js"
        data-id="123456">
</script>
```

### Manual init

```html
<script async defer src="siteclue-tracker.js"></script>
<script>
    siteClue.init('123456');
</script>
```

## Sending events

Events are custom interactions measured independently from the page views.

Events have a three-level naming hierarchy:

- `category`
- `action`
- `label`

Values for all three can be any custom names.

The `label` is optional.

### Automatic event attachment

```html
<button data-siteclue-event="click:button/clicked/data">
    Click me
</button>
```

`data-siteclue-event` field value is built from 4 parts:

```
trigger:category/action[/label]
```

`trigger` is a [JavaScript event](https://developer.mozilla.org/en-US/docs/Web/API/Element#events)
name to attach the event trigger to.
For example, the `click` value will trigger event to be sent on element mouse click.

The `label` part is optional.

For the `click` trigger, there is a shorter helper for setting the event:

```html
<button data-siteclue-click="button/clicked/data">
    Click me
</button>
```

### Manual event sending

```js
siteClue.event('button', 'clicked', 'js');
```

Function parameters are, in order: `category`, `action`, and `label`.
