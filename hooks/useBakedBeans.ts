'use client';

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import { useCallback, useEffect, useState } from 'react';
import { PROGRAM_ID, GLOBAL_STATE_SEED, VAULT_SEED, USER_STATE_SEED } from '@/lib/config';
import IDL from '../bakedbeans_solana.json';

export interface UserStats {
    miners: number;
    eggs: number;
    lastHatch: number;
    referrer: string | null;
}

export interface GlobalStats {
    marketEggs: string;
    devFeeVal: number;
}

export const useBakedBeans = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const getProvider = useCallback(() => {
        if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
            return null;
        }
        return new AnchorProvider(connection, wallet as any, {
            commitment: 'confirmed',
        });
    }, [connection, wallet]);

    const getProgram = useCallback(() => {
        const provider = getProvider();
        if (!provider) return null;
        return new Program(IDL as any, provider);
    }, [getProvider]);

    const getPDAs = useCallback((userPubkey?: PublicKey) => {
        const [globalStatePda] = PublicKey.findProgramAddressSync(
            [Buffer.from(GLOBAL_STATE_SEED)],
            PROGRAM_ID
        );
        const [vaultPda] = PublicKey.findProgramAddressSync(
            [Buffer.from(VAULT_SEED)],
            PROGRAM_ID
        );
        const userStatePda = userPubkey
            ? PublicKey.findProgramAddressSync(
                [Buffer.from(USER_STATE_SEED), userPubkey.toBuffer()],
                PROGRAM_ID
            )[0]
            : null;

        return { globalStatePda, vaultPda, userStatePda };
    }, []);

    const fetchUserStats = useCallback(async () => {
        if (!wallet.publicKey) return;
        
        try {
            const program = getProgram();
            if (!program) return;

            const { userStatePda } = getPDAs(wallet.publicKey);
            if (!userStatePda) return;

            try {
                const userAccount = await (program.account as any).userState.fetch(userStatePda);
                const clock = await connection.getBlockTime(await connection.getSlot());
                
                // Calculate current eggs
                const timePassed = clock! - userAccount.lastHatch.toNumber();
                const secondsPassed = Math.min(1_080_000, timePassed);
                const eggsSinceLastHatch = secondsPassed * userAccount.hatcheryMiners.toNumber();
                const totalEggs = userAccount.claimedEggs.toNumber() + eggsSinceLastHatch;

                setUserStats({
                    miners: userAccount.hatcheryMiners.toNumber(),
                    eggs: totalEggs,
                    lastHatch: userAccount.lastHatch.toNumber(),
                    referrer: userAccount.referrer ? userAccount.referrer.toString() : null,
                });
                setIsInitialized(true);
            } catch (err) {
                // User not initialized
                setIsInitialized(false);
                setUserStats(null);
            }
        } catch (error) {
            console.error('Error fetching user stats:', error);
        }
    }, [wallet.publicKey, getProgram, getPDAs, connection]);

    const fetchGlobalStats = useCallback(async () => {
        try {
            const program = getProgram();
            if (!program) return;

            const { globalStatePda } = getPDAs();
            const globalAccount = await (program.account as any).globalState.fetch(globalStatePda);

            setGlobalStats({
                marketEggs: globalAccount.marketEggs.toString(),
                devFeeVal: globalAccount.devFeeVal,
            });
        } catch (error) {
            console.error('Error fetching global stats:', error);
        }
    }, [getProgram, getPDAs]);

    const initUser = useCallback(async () => {
        if (!wallet.publicKey) return;
        
        setLoading(true);
        try {
            const program = getProgram();
            if (!program) throw new Error('Program not initialized');

            const { userStatePda } = getPDAs(wallet.publicKey);
            if (!userStatePda) throw new Error('Cannot derive PDA');

            const tx = await program.methods
                .initUser()
                .accounts({
                    userState: userStatePda,
                    user: wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log('Init user tx:', tx);
            await fetchUserStats();
        } catch (error: any) {
            console.error('Error initializing user:', error);
            alert('Error initializing user: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [wallet.publicKey, getProgram, getPDAs, fetchUserStats]);

    const buyEggs = useCallback(async (solAmount: number) => {
        if (!wallet.publicKey) return;
        
        setLoading(true);
        try {
            const program = getProgram();
            if (!program) throw new Error('Program not initialized');

            const { globalStatePda, vaultPda, userStatePda } = getPDAs(wallet.publicKey);
            if (!userStatePda) throw new Error('Cannot derive PDA');

            const globalAccount = await (program.account as any).globalState.fetch(globalStatePda);
            const lamports = solAmount * LAMPORTS_PER_SOL;

            // Create transaction with SOL transfer - now automatically buys chickens!
            const tx = await (program.methods
                .buyEggs(new BN(lamports), null) as any)
                .accounts({
                    globalState: globalStatePda,
                    userState: userStatePda,
                    buyer: wallet.publicKey,
                    vault: vaultPda,
                    devWallet: globalAccount.devWallet,
                    referrerState: null,
                    systemProgram: SystemProgram.programId,
                })
                .preInstructions([
                    SystemProgram.transfer({
                        fromPubkey: wallet.publicKey,
                        toPubkey: vaultPda,
                        lamports,
                    }),
                ])
                .rpc();

            console.log('Buy chickens tx:', tx);
            await fetchUserStats();
        } catch (error: any) {
            console.error('Error buying eggs:', error);
            alert('Error buying eggs: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [wallet.publicKey, getProgram, getPDAs, fetchUserStats]);

    const hatchEggs = useCallback(async () => {
        if (!wallet.publicKey) return;
        
        setLoading(true);
        try {
            const program = getProgram();
            if (!program) throw new Error('Program not initialized');

            const { globalStatePda, userStatePda } = getPDAs(wallet.publicKey);
            if (!userStatePda) throw new Error('Cannot derive PDA');

            const tx = await (program.methods
                .hatchEggs(null) as any)
                .accounts({
                    globalState: globalStatePda,
                    userState: userStatePda,
                    user: wallet.publicKey,
                    referrerState: null,
                })
                .rpc();

            console.log('Hatch eggs tx:', tx);
            await fetchUserStats();
        } catch (error: any) {
            console.error('Error hatching eggs:', error);
            alert('Error hatching eggs: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [wallet.publicKey, getProgram, getPDAs, fetchUserStats]);

    const sellEggs = useCallback(async () => {
        if (!wallet.publicKey) return;
        
        setLoading(true);
        try {
            const program = getProgram();
            if (!program) throw new Error('Program not initialized');

            const { globalStatePda, vaultPda, userStatePda } = getPDAs(wallet.publicKey);
            if (!userStatePda) throw new Error('Cannot derive PDA');

            const globalAccount = await (program.account as any).globalState.fetch(globalStatePda);

            const tx = await program.methods
                .sellEggs()
                .accounts({
                    globalState: globalStatePda,
                    userState: userStatePda,
                    user: wallet.publicKey,
                    vault: vaultPda,
                    devWallet: globalAccount.devWallet,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log('Sell eggs tx:', tx);
            await fetchUserStats();
        } catch (error: any) {
            console.error('Error selling eggs:', error);
            alert('Error selling eggs: ' + error.message);
        } finally {
            setLoading(false);
        }
    }, [wallet.publicKey, getProgram, getPDAs, fetchUserStats]);

    useEffect(() => {
        if (wallet.publicKey) {
            fetchUserStats();
            fetchGlobalStats();
            
            const interval = setInterval(() => {
                fetchUserStats();
            }, 5000); // Update every 5 seconds

            return () => clearInterval(interval);
        }
    }, [wallet.publicKey, fetchUserStats, fetchGlobalStats]);

    return {
        userStats,
        globalStats,
        loading,
        isInitialized,
        initUser,
        buyEggs,
        hatchEggs,
        sellEggs,
        getPDAs,
    };
};
