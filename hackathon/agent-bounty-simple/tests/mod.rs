use agent_bounty_simple::{process_instruction, BountyInstruction, Bounty, BountyStatus};
use solana_program::{
    account_info::AccountInfo,
    clock::Epoch,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
};
use solana_program_test::*;
use solana_sdk::{
    account::Account,
    signature::{Keypair, Signer},
    transaction::Transaction,
};
use borsh::{BorshDeserialize, BorshSerialize};
use std::mem;

#[tokio::test]
async fn test_create_bounty() {
    let program_id = Pubkey::new_unique();
    let mut program_test = ProgramTest::new(
        "agent_bounty_simple",
        program_id,
        processor!(process_instruction),
    );
    
    let bounty_keypair = Keypair::new();
    let creator_keypair = Keypair::new();
    
    // Add account for bounty data
    program_test.add_account(
        bounty_keypair.pubkey(),
        Account {
            lamports: Rent::default().minimum_balance(1000),
            data: vec![0; 1000],
            owner: program_id,
            ..Account::default()
        },
    );
    
    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;
    
    let instruction_data = BountyInstruction::CreateBounty {
        title: "Test AI Task".to_string(),
        description: "Complete this AI agent task for 0.1 SOL".to_string(),
        reward: 100_000_000, // 0.1 SOL in lamports
    };
    
    let serialized_data = instruction_data.try_to_vec().unwrap();
    
    let instruction = solana_program::instruction::Instruction::new_with_bytes(
        program_id,
        &serialized_data,
        vec![
            solana_program::instruction::AccountMeta::new(bounty_keypair.pubkey(), false),
            solana_program::instruction::AccountMeta::new(creator_keypair.pubkey(), true),
        ],
    );
    
    let transaction = Transaction::new_signed_with_payer(
        &[instruction],
        Some(&payer.pubkey()),
        &[&payer, &creator_keypair],
        recent_blockhash,
    );
    
    let result = banks_client.process_transaction(transaction).await;
    assert!(result.is_ok(), "Bounty creation failed: {:?}", result);
    
    // Verify bounty was created correctly
    let bounty_account = banks_client.get_account(bounty_keypair.pubkey()).await.unwrap().unwrap();
    let bounty = Bounty::try_from_slice(&bounty_account.data).unwrap();
    
    assert_eq!(bounty.title, "Test AI Task");
    assert_eq!(bounty.reward, 100_000_000);
    assert_eq!(bounty.status, BountyStatus::Open);
    assert_eq!(bounty.creator, creator_keypair.pubkey());
}

#[tokio::test]
async fn test_claim_bounty() {
    let program_id = Pubkey::new_unique();
    let mut program_test = ProgramTest::new(
        "agent_bounty_simple",
        program_id,
        processor!(process_instruction),
    );
    
    let bounty_keypair = Keypair::new();
    let creator_keypair = Keypair::new();
    let agent_keypair = Keypair::new();
    
    // Create bounty first
    let bounty = Bounty {
        creator: creator_keypair.pubkey(),
        title: "Test Task".to_string(),
        description: "Test Description".to_string(),
        reward: 50_000_000,
        status: BountyStatus::Open,
        assigned_agent: None,
    };
    
    let bounty_data = bounty.try_to_vec().unwrap();
    program_test.add_account(
        bounty_keypair.pubkey(),
        Account {
            lamports: Rent::default().minimum_balance(bounty_data.len()),
            data: bounty_data,
            owner: program_id,
            ..Account::default()
        },
    );
    
    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;
    
    // Test claiming the bounty
    let claim_instruction_data = BountyInstruction::ClaimBounty;
    let serialized_claim = claim_instruction_data.try_to_vec().unwrap();
    
    let claim_instruction = solana_program::instruction::Instruction::new_with_bytes(
        program_id,
        &serialized_claim,
        vec![
            solana_program::instruction::AccountMeta::new(bounty_keypair.pubkey(), false),
            solana_program::instruction::AccountMeta::new(agent_keypair.pubkey(), true),
        ],
    );
    
    let claim_transaction = Transaction::new_signed_with_payer(
        &[claim_instruction],
        Some(&payer.pubkey()),
        &[&payer, &agent_keypair],
        recent_blockhash,
    );
    
    let result = banks_client.process_transaction(claim_transaction).await;
    assert!(result.is_ok(), "Bounty claiming failed: {:?}", result);
    
    // Verify bounty was claimed
    let updated_bounty_account = banks_client.get_account(bounty_keypair.pubkey()).await.unwrap().unwrap();
    let updated_bounty = Bounty::try_from_slice(&updated_bounty_account.data).unwrap();
    
    assert_eq!(updated_bounty.status, BountyStatus::InProgress);
    assert_eq!(updated_bounty.assigned_agent, Some(agent_keypair.pubkey()));
}

#[tokio::test]
async fn test_complete_bounty() {
    let program_id = Pubkey::new_unique();
    let mut program_test = ProgramTest::new(
        "agent_bounty_simple",
        program_id,
        processor!(process_instruction),
    );
    
    let bounty_keypair = Keypair::new();
    let creator_keypair = Keypair::new();
    let agent_keypair = Keypair::new();
    
    // Create claimed bounty
    let bounty = Bounty {
        creator: creator_keypair.pubkey(),
        title: "Test Task".to_string(),
        description: "Test Description".to_string(),
        reward: 75_000_000,
        status: BountyStatus::InProgress,
        assigned_agent: Some(agent_keypair.pubkey()),
    };
    
    let bounty_data = bounty.try_to_vec().unwrap();
    program_test.add_account(
        bounty_keypair.pubkey(),
        Account {
            lamports: Rent::default().minimum_balance(bounty_data.len()),
            data: bounty_data,
            owner: program_id,
            ..Account::default()
        },
    );
    
    let (mut banks_client, payer, recent_blockhash) = program_test.start().await;
    
    // Test completing the bounty
    let complete_instruction_data = BountyInstruction::CompleteBounty;
    let serialized_complete = complete_instruction_data.try_to_vec().unwrap();
    
    let complete_instruction = solana_program::instruction::Instruction::new_with_bytes(
        program_id,
        &serialized_complete,
        vec![
            solana_program::instruction::AccountMeta::new(bounty_keypair.pubkey(), false),
            solana_program::instruction::AccountMeta::new(agent_keypair.pubkey(), true),
        ],
    );
    
    let complete_transaction = Transaction::new_signed_with_payer(
        &[complete_instruction],
        Some(&payer.pubkey()),
        &[&payer, &agent_keypair],
        recent_blockhash,
    );
    
    let result = banks_client.process_transaction(complete_transaction).await;
    assert!(result.is_ok(), "Bounty completion failed: {:?}", result);
    
    // Verify bounty was completed
    let final_bounty_account = banks_client.get_account(bounty_keypair.pubkey()).await.unwrap().unwrap();
    let final_bounty = Bounty::try_from_slice(&final_bounty_account.data).unwrap();
    
    assert_eq!(final_bounty.status, BountyStatus::Completed);
}

#[test]
fn test_bounty_serialization() {
    let bounty = Bounty {
        creator: Pubkey::new_unique(),
        title: "Serialization Test".to_string(),
        description: "Testing borsh serialization".to_string(),
        reward: 1_000_000,
        status: BountyStatus::Open,
        assigned_agent: None,
    };
    
    let serialized = bounty.try_to_vec().unwrap();
    let deserialized = Bounty::try_from_slice(&serialized).unwrap();
    
    assert_eq!(bounty.title, deserialized.title);
    assert_eq!(bounty.description, deserialized.description);
    assert_eq!(bounty.reward, deserialized.reward);
    assert_eq!(bounty.status, deserialized.status);
    assert_eq!(bounty.creator, deserialized.creator);
}