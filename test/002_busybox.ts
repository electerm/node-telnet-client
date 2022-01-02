import { expect } from 'chai'
import { Telnet } from '../src'
import { createServer, Server, Socket } from 'net'

let server: Server

describe('busybox', () => {
  before(done => {
    server = createServer((c: Socket) => {
      c.write(Buffer.from('BusyBox v1.19.2 () built-in shell (ash)\n'
        + "Enter 'help' for a list of built-in commands.\n\n/ # ", 'ascii'))

      c.on('data', () => {
        c.write(Buffer.from('uptime\r\n23:14  up 1 day, 21:50, 6 users, '
          + 'load averages: 1.41 1.43 1.41\r\n', 'ascii'))
        c.write(Buffer.from('/ # ', 'ascii'))
      })
    })

    server.listen(2323, done)
  })

  after(done => server.close(done))

  it('exec_string_shell_prompt', done => {
    const connection = new Telnet()
    const params = {
      host: '127.0.0.1',
      port: 2323,
      shellPrompt: '/ # ',
      timeout: 1500
    }

    connection.on('ready', () => {
      connection.exec('uptime', (_err, resp) => {
        connection.end().finally()

        expect(resp).to.equal('23:14  up 1 day, 21:50, 6 users, load averages: 1.41 1.43 1.41\n')
        done()
      }).finally()
    })

    connection.connect(params).finally()
  })

  it('exec_regex_shell_prompt', done => {
    const connection = new Telnet()
    const params = {
      host: '127.0.0.1',
      port: 2323,
      shellPrompt: /\/ #(?: )?/,
      timeout: 1500
    }

    connection.on('ready', () => {
      connection.exec('uptime', (_err, resp) => {
        connection.end().finally()

        expect(resp).to.equal('23:14  up 1 day, 21:50, 6 users, load averages: 1.41 1.43 1.41\n')
        done()
      }).finally()
    })

    connection.connect(params).finally()
  })
})
