const { request } = require("express");

class BaseCron {
    constructor(sqlConn, url, sqlTable) {}

    async run() {
        var readStream = await this.read();
        var transformedStream = await this.transform(readStream);
        await write(transformedStream);
    }

    // Return a stream.readable
    async read() {
        throw Error("unimplemented method read");
        // const response = await axios.get(esoUrl, {params, headers: {Accept: 'application/json'}})
        // return response as a stream.
    }

    // takes in a stream and returns stream.readable
    async transform(stream)  {
        throw Error("unimplemented method transform");
    }

    async write(stream)  {
        // write to sql
        throw Error("unimplemented method write");
    }
}

class PunchcesCron extends BaseCron {
    read(){
        // read from the punches API.
        request(url)
    }
}