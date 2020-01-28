import { SecureRandom, rng_seed_time } from 'jsbn';

export function MtpSecureRandomModule() {
    // $(window).on('click keydown', rng_seed_time);
    window.addEventListener('mousedown', rng_seed_time);
    return new SecureRandom();
}
