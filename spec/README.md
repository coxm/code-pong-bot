# Code Pong Bot
An IRC bot for code pong, with an API for communication with the Git server.


## API
The following endpoints are available. All dates must be in UTC form.

-   GET `/baton`: retrieves the user currently holding the baton, and the time
    they grabbed it. Returns: a JSON response of the form

        {
            // The user name, or null if nobody has the baton.
            user: string | null
            // The time the baton was last modified (grabbed or returned).
            time: ISO8601-UTC-date-string | null
        }

-   POST  `/baton/gimme`: attempts to grab the baton for a specified user.
    Requires a JSON body of the form

        {
            // The name of the user attempting to grab the baton.
            user: string
        }

    Returns a JSON response of the form

        {
            // Whether the gimme attempt was successful.
            success: boolean
        }

    If the baton is successfully grabbed, the IRC bot will also make an
    announcement.

-   POST `/baton/release`: attempts to release the baton from the current user.
    Returns an empty 204 response.


## IRC bot
The IRC bot makes announcements when triggered by the API, as described above.
In the IRC channel, the following commands are available (but must be preceeded
by the specified prefix).

-   `baton`: returns a message describing who has the baton and when they
    grabbed it.

-   `gimme`: attempts to grab the baton for the specified user
    (defaults to the message sender's IRC nick).
