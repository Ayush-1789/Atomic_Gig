import { compile } from '@fleet-sdk/compiler'
import { Network } from '@fleet-sdk/common'
import { ESCROW_LOCK_SCRIPT } from './scripts'

export function compileContract(network: 'mainnet' | 'testnet' = 'testnet') {
    const tree = compile(ESCROW_LOCK_SCRIPT, {
        version: 1, // ErgoTree version 1 (compatible with most nodes)
        includeSize: false
    })

    return tree.toAddress(network === 'mainnet' ? Network.Mainnet : Network.Testnet).toString()
}
