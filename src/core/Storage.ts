import * as fs from 'fs';
import * as path from 'path';
const watch = require("watchwithproxy");

export class StorageInstance {
    constructor(namespace : string, context:Storage) {
        this._path = path.join(context.path, namespace);
        if ( !fs.existsSync( this._path ) ) {
            fs.mkdirSync(this._path);
        }
    }

    save(stor:string, data:any) {
        let fp = path.join( this._path, stor + ".json" );
        fs.writeFile( fp, JSON.stringify(data, null, 4), (er) => {
            throw new Error("[Storage] There was an issue saving " + fp + er.message);
        });
    }

    load(stor:string) : any {
        let fp = path.join(this._path, stor + ".json");
        if (!fs.existsSync(fp)) {
            throw new Error("[Storage] File does not exist " + fp);
        }

        let re = fs.readFileSync(fp, "utf8");
        if (!re) {
            throw new Error("[Storage] Could not load file " + fp);
        }

        let ob = JSON.parse(re);

        return ob;
    }

    private _path : string;
}

export class Storage {
    public get path() {
        return this._path;
    }
    constructor(storagePath : string) {
        this._path = storagePath;
    }

    initStorage(namespace : string) : StorageInstance {
        
        let storage = new StorageInstance(namespace, this);

        watch.Watcher.Watch(storage, new watch.WatchOptions(), (s:any, p:string, o:any, n:any) => {
            
        });

        return storage;
    }

    private _path = "";
}