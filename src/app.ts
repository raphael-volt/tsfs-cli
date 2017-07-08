import * as commander from 'commander'
import { tsfs, FileStatsTree, FileStats } from 'tsfs'
import * as path from "path";
import * as colors from "colors"
import * as fs from "fs";
export class App {

    private commander: commander.CommanderStatic
    constructor() {
        this.commander = commander
    }

    private errorHandler = (error: Error) => {
        console.log(colors.red(error.message))
        console.log(colors.grey(error.stack))
        process.exit(1)
    }

    public initialize() {
        this.commander
            .version('0.0.1')

        this.commander.command(
            "index [directory][options]")
            .description("Generate or delete recursively the index.ts files in a Typescript source folder")
            .action(this.indexCommad)

        this.commander.command(
            "tree [directory]")
            .description("Output a tree view")
            .action(this.treeCommad)


        this.commander.command(
            "rmext <ext> [directory]")
            .description("Delete recursively files whith specified ext")
            .action(this.deleteByExtension)

        this.commander.option("-d, --delete", "Delete index.ts").parse(process.argv)
    }

    private deleteByExtension = (extension: string, directory: string) => {
        directory = this.getDirectory(directory)
        const re: RegExp = new RegExp(`.${extension}$`, "i")
        let files: FileStats[] = []
        let sub = tsfs.findRecurseAsync(directory, true).subscribe(
            (stats: FileStats) => {
                if(re.test(stats.basename))
                    files.push(stats)
            },
            error => {
                sub.unsubscribe()
                this.errorHandler(error)
            },
            () => {
                sub.unsubscribe()
                if(! files.length) {
                    console.log(colors.yellow("No files found."))
                    process.exit(0)
                }
                else {
                    let count: number = 0
                    let next = () => {
                        if(files.length) {
                            let stats: FileStats = files.shift()
                            fs.unlink(
                                stats.path,
                                (error: NodeJS.ErrnoException) => {
                                    if(error)
                                        console.log(colors.red.bold("could not delete file") + " : " + stats.path)
                                    else {
                                        count ++
                                        console.log(colors.green.bold("deleted") + " : " + stats.path)
                                    }
                                    next()
                                }
                            )       
                        }
                        else {
                            let pl: string = count > 1 ? "s ":""
                            console.log(colors.blue(`${count} deleted file${pl}`))
                            process.exit(0)
                        }
                    }

                    next()
                }
            }
        )
    }


    private indexCommad = (directory: any, options: any) => {

        if (this.commander.delete)
            tsfs.deleteTsIndex(directory)
        else
            tsfs.generateTsIndex(directory)
    }

    private treeCommad = (directory: any) => {
        directory = this.getDirectory(directory)
        tsfs.treeAsync(directory).subscribe(
            tree => {
                tsfs.treeToString(tree)
            },
            (error: Error) => {
                console.log(colors.red(error.message))
                console.log(colors.grey(error.stack))
                process.exit(1)
            },
            () => {
                process.exit(0)
            }
        )
    }

    private getDirectory(directory: string): string {
        if (!directory)
            return process.cwd()
        return path.resolve(directory)
    }
}