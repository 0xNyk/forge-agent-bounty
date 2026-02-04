use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};

declare_id!("AgentBounty11111111111111111111111111111111");

#[program]
pub mod agent_bounty {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.authority = ctx.accounts.authority.key();
        marketplace.total_bounties = 0;
        marketplace.total_volume = 0;
        Ok(())
    }

    pub fn create_bounty(
        ctx: Context<CreateBounty>,
        title: String,
        description: String,
        requirements: String,
        reward: u64,
        deadline: i64,
    ) -> Result<()> {
        require!(title.len() <= 100, ErrorCode::TitleTooLong);
        require!(description.len() <= 500, ErrorCode::DescriptionTooLong);
        require!(requirements.len() <= 200, ErrorCode::RequirementsTooLong);
        require!(reward > 0, ErrorCode::InvalidReward);
        require!(deadline > Clock::get()?.unix_timestamp, ErrorCode::InvalidDeadline);

        let bounty = &mut ctx.accounts.bounty;
        bounty.id = ctx.accounts.marketplace.total_bounties;
        bounty.creator = ctx.accounts.creator.key();
        bounty.title = title;
        bounty.description = description;
        bounty.requirements = requirements;
        bounty.reward = reward;
        bounty.deadline = deadline;
        bounty.status = BountyStatus::Open;
        bounty.assigned_agent = None;
        bounty.created_at = Clock::get()?.unix_timestamp;
        bounty.completion_data = None;
        bounty.submission_url = None;
        bounty.rejection_reason = None;
        bounty.submitted_at = None;
        bounty.completed_at = None;

        // Transfer tokens to escrow
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.creator_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.creator.to_account_info(),
            },
        );
        token::transfer(transfer_ctx, reward)?;

        let marketplace = &mut ctx.accounts.marketplace;
        marketplace.total_bounties += 1;
        marketplace.total_volume += reward;

        Ok(())
    }

    pub fn claim_bounty(ctx: Context<ClaimBounty>) -> Result<()> {
        let bounty = &mut ctx.accounts.bounty;
        require!(bounty.status == BountyStatus::Open, ErrorCode::BountyNotOpen);
        require!(bounty.deadline > Clock::get()?.unix_timestamp, ErrorCode::BountyExpired);

        bounty.status = BountyStatus::InProgress;
        bounty.assigned_agent = Some(ctx.accounts.agent.key());

        // Update or create agent profile
        let agent_profile = &mut ctx.accounts.agent_profile;
        if agent_profile.agent != ctx.accounts.agent.key() {
            agent_profile.agent = ctx.accounts.agent.key();
            agent_profile.reputation_score = 1000; // Starting score
            agent_profile.completed_bounties = 0;
            agent_profile.total_earned = 0;
        }

        Ok(())
    }

    pub fn submit_completion(
        ctx: Context<SubmitCompletion>,
        completion_data: String,
        submission_url: String,
    ) -> Result<()> {
        require!(completion_data.len() <= 500, ErrorCode::CompletionDataTooLong);
        require!(submission_url.len() <= 100, ErrorCode::UrlTooLong);

        let bounty = &mut ctx.accounts.bounty;
        require!(bounty.status == BountyStatus::InProgress, ErrorCode::BountyNotInProgress);
        require!(bounty.assigned_agent == Some(ctx.accounts.agent.key()), ErrorCode::NotAssignedAgent);

        bounty.status = BountyStatus::PendingReview;
        bounty.completion_data = Some(completion_data);
        bounty.submission_url = Some(submission_url);
        bounty.submitted_at = Some(Clock::get()?.unix_timestamp);

        Ok(())
    }

    pub fn approve_completion(ctx: Context<ApproveCompletion>) -> Result<()> {
        let bounty = &mut ctx.accounts.bounty;
        require!(bounty.status == BountyStatus::PendingReview, ErrorCode::BountyNotPendingReview);
        require!(bounty.creator == ctx.accounts.creator.key(), ErrorCode::NotBountyCreator);

        bounty.status = BountyStatus::Completed;
        bounty.completed_at = Some(Clock::get()?.unix_timestamp);

        // Calculate platform fee (5%)
        let platform_fee = bounty.reward * 5 / 100;
        let agent_payment = bounty.reward - platform_fee;

        // Transfer payment to agent
        let seeds = &[
            b"escrow",
            bounty.creator.as_ref(),
            &bounty.id.to_le_bytes(),
            &[ctx.bumps.escrow_token_account],
        ];
        let signer = &[&seeds[..]];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.agent_token_account.to_account_info(),
                authority: ctx.accounts.escrow_token_account.to_account_info(),
            },
            signer,
        );
        token::transfer(transfer_ctx, agent_payment)?;

        // Update agent profile
        let agent_profile = &mut ctx.accounts.agent_profile;
        agent_profile.completed_bounties += 1;
        agent_profile.total_earned += agent_payment;
        agent_profile.reputation_score += 50; // Boost reputation

        Ok(())
    }

    pub fn reject_completion(ctx: Context<RejectCompletion>, reason: String) -> Result<()> {
        require!(reason.len() <= 200, ErrorCode::ReasonTooLong);

        let bounty = &mut ctx.accounts.bounty;
        require!(bounty.status == BountyStatus::PendingReview, ErrorCode::BountyNotPendingReview);
        require!(bounty.creator == ctx.accounts.creator.key(), ErrorCode::NotBountyCreator);

        bounty.status = BountyStatus::Open;
        bounty.assigned_agent = None;
        bounty.completion_data = None;
        bounty.submission_url = None;
        bounty.submitted_at = None;
        bounty.rejection_reason = Some(reason);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8 + 8, // discriminator + pubkey + u64 + u64
        seeds = [b"marketplace"],
        bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateBounty<'info> {
    #[account(
        init,
        payer = creator,
        space = 8 + Bounty::INIT_SPACE,
        seeds = [b"bounty", creator.key().as_ref(), &marketplace.total_bounties.to_le_bytes()],
        bump
    )]
    pub bounty: Box<Account<'info, Bounty>>,
    #[account(
        init,
        payer = creator,
        token::mint = mint,
        token::authority = escrow_token_account,
        seeds = [b"escrow", creator.key().as_ref(), &marketplace.total_bounties.to_le_bytes()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"marketplace"],
        bump
    )]
    pub marketplace: Account<'info, Marketplace>,
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,
    pub mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct ClaimBounty<'info> {
    #[account(mut)]
    pub bounty: Account<'info, Bounty>,
    #[account(
        init_if_needed,
        payer = agent,
        space = 8 + 32 + 4 + 4 + 8, // discriminator + pubkey + u32 + u32 + u64
        seeds = [b"agent", agent.key().as_ref()],
        bump
    )]
    pub agent_profile: Account<'info, AgentProfile>,
    #[account(mut)]
    pub agent: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SubmitCompletion<'info> {
    #[account(mut)]
    pub bounty: Account<'info, Bounty>,
    pub agent: Signer<'info>,
}

#[derive(Accounts)]
pub struct ApproveCompletion<'info> {
    #[account(mut)]
    pub bounty: Account<'info, Bounty>,
    #[account(
        mut,
        seeds = [b"escrow", creator.key().as_ref(), &bounty.id.to_le_bytes()],
        bump
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        seeds = [b"agent", bounty.assigned_agent.unwrap().as_ref()],
        bump
    )]
    pub agent_profile: Account<'info, AgentProfile>,
    #[account(mut)]
    pub agent_token_account: Account<'info, TokenAccount>,
    pub creator: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RejectCompletion<'info> {
    #[account(mut)]
    pub bounty: Account<'info, Bounty>,
    pub creator: Signer<'info>,
}

#[account]
pub struct Marketplace {
    pub authority: Pubkey,
    pub total_bounties: u64,
    pub total_volume: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Bounty {
    pub id: u64,
    pub creator: Pubkey,
    #[max_len(100)]
    pub title: String,
    #[max_len(500)]
    pub description: String,
    #[max_len(200)]
    pub requirements: String,
    pub reward: u64,
    pub deadline: i64,
    pub status: BountyStatus,
    pub assigned_agent: Option<Pubkey>,
    pub created_at: i64,
    pub submitted_at: Option<i64>,
    pub completed_at: Option<i64>,
    #[max_len(500)]
    pub completion_data: Option<String>,
    #[max_len(100)]
    pub submission_url: Option<String>,
    #[max_len(200)]
    pub rejection_reason: Option<String>,
}

#[account]
pub struct AgentProfile {
    pub agent: Pubkey,
    pub reputation_score: u32,
    pub completed_bounties: u32,
    pub total_earned: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum BountyStatus {
    Open,
    InProgress,
    PendingReview,
    Completed,
    Expired,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Title too long")]
    TitleTooLong,
    #[msg("Description too long")]
    DescriptionTooLong,
    #[msg("Requirements too long")]
    RequirementsTooLong,
    #[msg("Invalid reward amount")]
    InvalidReward,
    #[msg("Invalid deadline")]
    InvalidDeadline,
    #[msg("Bounty is not open")]
    BountyNotOpen,
    #[msg("Bounty has expired")]
    BountyExpired,
    #[msg("Bounty is not in progress")]
    BountyNotInProgress,
    #[msg("Not the assigned agent")]
    NotAssignedAgent,
    #[msg("Bounty is not pending review")]
    BountyNotPendingReview,
    #[msg("Not the bounty creator")]
    NotBountyCreator,
    #[msg("Completion data too long")]
    CompletionDataTooLong,
    #[msg("URL too long")]
    UrlTooLong,
    #[msg("Reason too long")]
    ReasonTooLong,
}