import path from "node:path";
import { Router } from "express";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/rbac";
import { logAudit } from "../../middleware/audit";
import { getReportData } from "./reports.service";

export const reportsRouter = Router();
reportsRouter.use(authMiddleware, requireRole("qa"));

const FONT_DIR = path.join(__dirname, "../../../assets/fonts");
const FONT_REGULAR = path.join(FONT_DIR, "Sarabun-Regular.ttf");
const FONT_BOLD = path.join(FONT_DIR, "Sarabun-Bold.ttf");

const STATUS_LABEL_TH: Record<string, string> = {
  todo: "ยังไม่ดำเนินการ",
  progress: "กำลังรวบรวม",
  review: "รอตรวจ",
  approved: "ผ่านการตรวจสอบ",
  revise: "ต้องแก้ไข",
};

// GET /api/reports/summary.pdf — รายงานสรุปความคืบหน้า (ฉบับย่อ พิมพ์ได้) — เฉพาะงานประกันคุณภาพ
reportsRouter.get("/summary.pdf", async (req, res, next) => {
  try {
    const data = await getReportData();
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.registerFont("Sarabun", FONT_REGULAR);
    doc.registerFont("Sarabun-Bold", FONT_BOLD);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="qaems-summary.pdf"');
    doc.pipe(res);

    doc.font("Sarabun-Bold").fontSize(16).text("วิทยาลัยเทคนิคอุบลราชธานี");
    doc.font("Sarabun-Bold").fontSize(13).text("รายงานสรุปความคืบหน้าหลักฐานประกันคุณภาพ");
    doc
      .font("Sarabun")
      .fontSize(9)
      .fillColor("#555555")
      .text(`สร้างโดย: ${req.user!.email}   วันที่: ${data.generatedAt.toLocaleString("th-TH")}`)
      .fillColor("black");
    doc.moveDown(1);

    doc.font("Sarabun-Bold").fontSize(12).text("ภาพรวม");
    doc
      .font("Sarabun")
      .fontSize(10)
      .text(
        `รวมทั้งหมด ${data.overall.total} รายการ — ผ่านการตรวจสอบ ${data.overall.approved}, รอตรวจ ${data.overall.review}, ต้องแก้ไข ${data.overall.revise}, กำลังรวบรวม ${data.overall.progress}, ยังไม่ดำเนินการ ${data.overall.todo}`,
      );
    doc.moveDown(1);

    doc.font("Sarabun-Bold").fontSize(12).text("สถานะรายมาตรฐาน");
    doc.moveDown(0.3);
    const stdColX = [40, 90, 320, 380, 440];
    doc.font("Sarabun-Bold").fontSize(9);
    doc.text("รหัส", stdColX[0], doc.y, { continued: false });
    doc.text("มาตรฐาน", stdColX[1], doc.y - doc.currentLineHeight());
    doc.text("รวม", stdColX[2], doc.y - doc.currentLineHeight());
    doc.text("ผ่าน", stdColX[3], doc.y - doc.currentLineHeight());
    doc.text("ต้องแก้ไข", stdColX[4], doc.y - doc.currentLineHeight());
    doc.moveDown(0.5);
    doc.font("Sarabun").fontSize(9);
    for (const std of data.byStandard) {
      const y = doc.y;
      doc.text(std.code, stdColX[0], y, { width: 45 });
      doc.text(std.nameTh, stdColX[1], y, { width: 220 });
      doc.text(String(std.total), stdColX[2], y, { width: 50 });
      doc.text(String(std.approved), stdColX[3], y, { width: 50 });
      doc.text(String(std.revise), stdColX[4], y, { width: 50 });
      doc.moveDown(0.6);
    }
    doc.moveDown(0.7);

    doc.font("Sarabun-Bold").fontSize(12).text("ความพร้อมรายตัวชี้วัด");
    doc.moveDown(0.3);
    const indColX = [40, 90, 400, 450, 500];
    doc.font("Sarabun-Bold").fontSize(9);
    doc.text("รหัส", indColX[0], doc.y);
    doc.text("ตัวชี้วัด", indColX[1], doc.y - doc.currentLineHeight());
    doc.text("ผ่าน/รวม", indColX[2], doc.y - doc.currentLineHeight());
    doc.text("ร้อยละ", indColX[3], doc.y - doc.currentLineHeight());
    doc.text("ต้องแก้ไข", indColX[4], doc.y - doc.currentLineHeight());
    doc.moveDown(0.5);
    doc.font("Sarabun").fontSize(9);
    for (const ind of data.byIndicator) {
      if (doc.y > 760) doc.addPage();
      const y = doc.y;
      doc.text(`${ind.standardCode}·${ind.code}`, indColX[0], y, { width: 45 });
      doc.text(ind.nameTh, indColX[1], y, { width: 300 });
      doc.text(`${ind.approved}/${ind.total}`, indColX[2], y, { width: 45 });
      doc.text(`${ind.pctComplete}%`, indColX[3], y, { width: 45 });
      doc.text(ind.hasRevise ? "มี" : "-", indColX[4], y, { width: 45 });
      doc.moveDown(0.6);
    }

    doc.end();

    await logAudit({ userId: req.user!.sub, action: "export", entityType: "Report", meta: { format: "pdf" } });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/summary.xlsx — รายงานฉบับเต็ม (Excel) — เฉพาะงานประกันคุณภาพ
reportsRouter.get("/summary.xlsx", async (req, res, next) => {
  try {
    const data = await getReportData();
    const workbook = new ExcelJS.Workbook();
    workbook.creator = req.user!.email;
    workbook.created = data.generatedAt;

    const overviewSheet = workbook.addWorksheet("ภาพรวม");
    overviewSheet.addRow(["วิทยาลัยเทคนิคอุบลราชธานี — รายงานสรุปความคืบหน้าหลักฐานประกันคุณภาพ"]);
    overviewSheet.addRow([`สร้างโดย ${req.user!.email} เมื่อ ${data.generatedAt.toLocaleString("th-TH")}`]);
    overviewSheet.addRow([]);
    overviewSheet.addRow(["สถานะ", "จำนวน"]);
    overviewSheet.addRow(["ยังไม่ดำเนินการ", data.overall.todo]);
    overviewSheet.addRow(["กำลังรวบรวม", data.overall.progress]);
    overviewSheet.addRow(["รอตรวจ", data.overall.review]);
    overviewSheet.addRow(["ผ่านการตรวจสอบ", data.overall.approved]);
    overviewSheet.addRow(["ต้องแก้ไข", data.overall.revise]);
    overviewSheet.addRow(["รวมทั้งหมด", data.overall.total]);
    overviewSheet.addRow([]);
    overviewSheet.addRow(["รหัสมาตรฐาน", "ชื่อมาตรฐาน (TH)", "ชื่อมาตรฐาน (EN)", "รวม", "ผ่าน", "รอตรวจ", "ต้องแก้ไข", "กำลังรวบรวม", "ยังไม่ดำเนินการ"]);
    for (const std of data.byStandard) {
      overviewSheet.addRow([std.code, std.nameTh, std.nameEn, std.total, std.approved, std.review, std.revise, std.progress, std.todo]);
    }
    overviewSheet.getRow(1).font = { bold: true, size: 14 };
    overviewSheet.getRow(4).font = { bold: true };
    overviewSheet.columns.forEach((col) => (col.width = 22));

    const indicatorSheet = workbook.addWorksheet("ตัวชี้วัด");
    indicatorSheet.addRow(["มาตรฐาน", "รหัสตัวชี้วัด", "ชื่อ (TH)", "ชื่อ (EN)", "ผู้รับผิดชอบ", "ผ่าน/รวม", "ร้อยละ", "มีรายการต้องแก้ไข"]);
    indicatorSheet.getRow(1).font = { bold: true };
    for (const ind of data.byIndicator) {
      indicatorSheet.addRow([
        ind.standardCode,
        ind.code,
        ind.nameTh,
        ind.nameEn,
        ind.assignees.join(", ") || "-",
        `${ind.approved}/${ind.total}`,
        `${ind.pctComplete}%`,
        ind.hasRevise ? "ใช่" : "ไม่",
      ]);
    }
    indicatorSheet.columns.forEach((col) => (col.width = 22));

    const detailSheet = workbook.addWorksheet("รายละเอียดหลักฐาน");
    detailSheet.addRow([
      "มาตรฐาน",
      "ตัวชี้วัด",
      "รายการหลักฐาน (TH)",
      "รายการหลักฐาน (EN)",
      "สถานะ",
      "จำนวนเอกสารแนบ",
      "อัปโหลดล่าสุดโดย",
      "อัปโหลดล่าสุดเมื่อ",
      "ข้อเสนอแนะล่าสุด",
    ]);
    detailSheet.getRow(1).font = { bold: true };
    for (const ev of data.evidenceDetail) {
      detailSheet.addRow([
        `${ev.standardCode} · ${ev.indicatorCode}`,
        `${ev.indicatorNameTh} / ${ev.indicatorNameEn}`,
        ev.descriptionTh,
        ev.descriptionEn,
        STATUS_LABEL_TH[ev.status] ?? ev.status,
        ev.attachmentCount,
        ev.lastUploadedBy ?? "-",
        ev.lastUploadedAt ? ev.lastUploadedAt.toLocaleString("th-TH") : "-",
        ev.latestReviewerNote ?? "-",
      ]);
    }
    detailSheet.columns.forEach((col) => (col.width = 24));

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="qaems-summary.xlsx"');
    await workbook.xlsx.write(res);
    res.end();

    await logAudit({ userId: req.user!.sub, action: "export", entityType: "Report", meta: { format: "xlsx" } });
  } catch (err) {
    next(err);
  }
});
