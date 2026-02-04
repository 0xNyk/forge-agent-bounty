use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
    sysvar::Sysvar,
};
use borsh::{BorshDeserialize, BorshSerialize};

entrypoint!(process_instruction);

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Bounty {
    pub creator: Pubkey,
    pub title: String,
    pub description: String,
    pub reward: u64,
    pub status: BountyStatus,
    pub assigned_agent: Option<Pubkey>,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, PartialEq)]
pub enum BountyStatus {
    Open,
    InProgress,
    Completed,
}

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum BountyInstruction {
    CreateBounty { title: String, description: String, reward: u64 },
    ClaimBounty,
    CompleteBounty,
}

pub fn process_instruction(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = BountyInstruction::try_from_slice(instruction_data)?;
    
    match instruction {
        BountyInstruction::CreateBounty { title, description, reward } => {
            msg!("Creating bounty: {}", title);
            create_bounty(accounts, title, description, reward)
        }
        BountyInstruction::ClaimBounty => {
            msg!("Claiming bounty");
            claim_bounty(accounts)
        }
        BountyInstruction::CompleteBounty => {
            msg!("Completing bounty");
            complete_bounty(accounts)
        }
    }
}

fn create_bounty(
    accounts: &[AccountInfo],
    title: String,
    description: String,
    reward: u64,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let bounty_account = next_account_info(account_info_iter)?;
    let creator = next_account_info(account_info_iter)?;
    
    let bounty = Bounty {
        creator: *creator.key,
        title,
        description,
        reward,
        status: BountyStatus::Open,
        assigned_agent: None,
    };
    
    bounty.serialize(&mut &mut bounty_account.data.borrow_mut()[..])?;
    msg!("Bounty created successfully");
    Ok(())
}

fn claim_bounty(accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let bounty_account = next_account_info(account_info_iter)?;
    let agent = next_account_info(account_info_iter)?;
    
    let mut bounty = Bounty::try_from_slice(&bounty_account.data.borrow())?;
    
    if bounty.status != BountyStatus::Open {
        return Err(ProgramError::InvalidAccountData);
    }
    
    bounty.status = BountyStatus::InProgress;
    bounty.assigned_agent = Some(*agent.key);
    
    bounty.serialize(&mut &mut bounty_account.data.borrow_mut()[..])?;
    msg!("Bounty claimed by agent: {}", agent.key);
    Ok(())
}

fn complete_bounty(accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let bounty_account = next_account_info(account_info_iter)?;
    let agent = next_account_info(account_info_iter)?;
    
    let mut bounty = Bounty::try_from_slice(&bounty_account.data.borrow())?;
    
    if bounty.status != BountyStatus::InProgress {
        return Err(ProgramError::InvalidAccountData);
    }
    
    if bounty.assigned_agent != Some(*agent.key) {
        return Err(ProgramError::InvalidAccountData);
    }
    
    bounty.status = BountyStatus::Completed;
    
    bounty.serialize(&mut &mut bounty_account.data.borrow_mut()[..])?;
    msg!("Bounty completed by agent: {}", agent.key);
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use solana_program::clock::Epoch;
    use std::mem;

    #[test]
    fn test_bounty_creation() {
        let program_id = Pubkey::default();
        let key = Pubkey::default();
        let mut lamports = 0;
        let mut data = vec![0; mem::size_of::<Bounty>() + 1000];
        let owner = Pubkey::default();
        let account = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports,
            &mut data,
            &owner,
            false,
            Epoch::default(),
        );
        
        let creator_key = Pubkey::default();
        let mut creator_lamports = 0;
        let mut creator_data = vec![];
        let creator = AccountInfo::new(
            &creator_key,
            true,
            false,
            &mut creator_lamports,
            &mut creator_data,
            &owner,
            false,
            Epoch::default(),
        );
        
        let accounts = vec![account, creator];
        
        let instruction_data = BountyInstruction::CreateBounty {
            title: "Test bounty".to_string(),
            description: "Test description".to_string(),
            reward: 1000,
        };
        
        let serialized = instruction_data.try_to_vec().unwrap();
        
        let result = process_instruction(&program_id, &accounts, &serialized);
        assert!(result.is_ok());
    }
}