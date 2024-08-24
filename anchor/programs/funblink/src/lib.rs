use anchor_lang::prelude::*;

declare_id!("D2uzKM3RRgzyvAuNiy6siidAGReRBYeRBD6U7EfWgS2Z");

#[program]
pub mod remed {
    use super::*;

    pub fn create_blink(
        ctx: Context<CreateBlink>,
        title: String,
        icon: String,
        description: String,
        label: String,
        to_pubkey: String,
        link: String,
    ) -> Result<()> {
        let blink = &mut ctx.accounts.blink;

        // Check if a Blink already exists
        if blink.is_initialized {
            return err!(ErrorCode::BlinkExists);
        }

        blink.is_initialized = true;
        blink.title = title;
        blink.icon = icon;
        blink.description = description;
        blink.label = label;
        blink.to_pubkey = to_pubkey;
        blink.link = link;

        Ok(())
    }

    pub fn close_blink(ctx: Context<CloseBlink>) -> Result<()> {
        let blink = &mut ctx.accounts.blink;

        // Check if the Blink account exists (is initialized)
        if !blink.is_initialized {
            return err!(ErrorCode::BlinkNotExist);
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateBlink<'info> {
    #[account(init, payer = signer, space = 8 + 20 + 1024, seeds = [b"blink", signer.key().as_ref()], bump)]
    pub blink: Account<'info, BlinkStruct>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CloseBlink<'info> {
    #[account(mut, close = signer, seeds = [b"blink", signer.key().as_ref()], bump)]
    pub blink: Account<'info, BlinkStruct>,
    #[account(mut)]
    pub signer: Signer<'info>,
}

#[account]
pub struct BlinkStruct {
    pub is_initialized: bool,
    pub title: String,
    pub icon: String,
    pub description: String,
    pub label: String,
    pub to_pubkey: String,
    pub link: String,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Blink exists")]
    BlinkExists,
    #[msg("Blink does not exist")]
    BlinkNotExist,
}
