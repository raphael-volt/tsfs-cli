import * as chai from 'chai';
import * as sinon from 'sinon';
import * as mocha from 'mocha';
import * as intercept from 'intercept-stdout';
import * as path from "path"
import * as fs from "fs"
import { tsfs } from 'tsfs'

describe('App', () => {
    
    it("should test tsfs", (done) => {
        tsfs.generateTsIndex(path.resolve(__dirname, "..", "src")).subscribe(
            success => { },
            done,
            () => {
                let filename: string = path.resolve(__dirname, "..", "src", "index.ts")
                chai.expect(fs.existsSync(filename)).to.be.true
                tsfs.deleteTsIndex(path.resolve(__dirname, "..", "src")).subscribe(
                    result => {},
                    done,
                    () => {
                        chai.expect(fs.existsSync(filename)).to.be.false
                        done()
                    }
                )
            }
        )
    })
})