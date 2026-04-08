export default function SajuFooter() {
  return (
    <footer className="bg-background border-t border-border py-5 px-5">
      <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        {/* 왼쪽: 사업자 정보 */}
        <div className="text-[11px] text-muted-foreground leading-relaxed space-y-0.5">
          <p>Your Company Name | 대표 Your Name | 사업자등록번호 000-00-00000</p>
          <p>통신판매업 제 0000-지역-0000 호</p>
          <p>Your Address</p>
        </div>

        {/* 오른쪽: 링크 + 카피라이트 */}
        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          <div className="flex items-center gap-3">
            <a href="mailto:your-email@example.com" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">문의</a>
            <a href="/terms" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">이용약관</a>
            <a href="/privacy-policy" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">개인정보처리방침</a>
            <a href="/refund-policy" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors">환불정책</a>
          </div>
          <p className="text-[11px] text-muted-foreground/60">
            &copy; 2026 사주랩
          </p>
        </div>
      </div>
    </footer>
  );
}
