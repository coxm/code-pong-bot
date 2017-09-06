# Admin commands
Admin commands are preceeded by a double prefix and a password (e.g.
`!!password`) and must be communicated to the bot in a private message:
`/msg <bot-nick> !!<password> <command> [...args]`. Here commands are listed
without any prefix.

-   `reload` reloads the bot code and configuration. Useful for upgrading on
    the fly, or testing changes. Notice that only code inside `/lib/` gets
    updated, and this will fail to reset properly if code holds references to
    objects from `/lib/`.
