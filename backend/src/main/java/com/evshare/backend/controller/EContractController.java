package com.evshare.backend.controller;

import com.evshare.backend.entity.User;
import com.evshare.backend.repository.UserRepository;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class EContractController {

    private final UserRepository userRepository;

    @PostMapping("/sign")
    public ResponseEntity<?> signContract(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        user.setIsContractSigned(true);
        userRepository.save(user);
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> downloadContract(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Font normalFont = new Font(Font.HELVETICA, 12, Font.NORMAL);
            Font italicFont = new Font(Font.HELVETICA, 12, Font.ITALIC);

            Paragraph title = new Paragraph("HOP DONG DONG SO HUU XE DIEN", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            com.evshare.backend.entity.Vehicle vehicle = user.getVehicle();
            String vehicleModel = vehicle != null ? vehicle.getModel() : "N/A";
            String licensePlate = vehicle != null ? vehicle.getLicensePlate() : "N/A";

            document.add(new Paragraph("Ngay lap: " + LocalDate.now(), normalFont));
            document.add(new Paragraph("Ben A (Dai dien EVShare): Cong ty TNHH EVShare", normalFont));
            document.add(new Paragraph("Ben B (Dong so huu): " + (user.getName() != null ? user.getName() : "N/A"), normalFont));
            document.add(new Paragraph("CCCD/CMND: " + (user.getCccd() != null ? user.getCccd() : "N/A"), normalFont));
            document.add(new Paragraph("Email: " + (user.getEmail() != null ? user.getEmail() : "N/A"), normalFont));
            document.add(new Paragraph("Thong tin xe: " + vehicleModel + " - BKS: " + licensePlate, normalFont));
            document.add(new Paragraph("Ty le so huu: " + (user.getOwnershipPercentage() != null ? user.getOwnershipPercentage() : 0.0) + "%", normalFont));
            
            document.add(new Paragraph("\nDieu khoan:", new Font(Font.HELVETICA, 14, Font.BOLD)));
            document.add(new Paragraph("1. Ben B dong y chia se chi phi van hanh xe theo ty le co phan.", normalFont));
            document.add(new Paragraph("2. Ben B duoc quyen su dung xe " + (user.getOwnershipPercentage() != null ? (user.getOwnershipPercentage() * 1.68) : 0) + " gio moi tuan.", normalFont));
            document.add(new Paragraph("3. Hop dong nay co gia tri phap ly tu ngay ky.", normalFont));
            
            document.add(new Paragraph("\nDai dien Ben A                                Dai dien Ben B", titleFont));
            
            if (user.getIsContractSigned() != null && user.getIsContractSigned()) {
                document.add(new Paragraph("(Da ky dien tu)                               [DA KY DIEN TU VAO NGAY " + LocalDate.now() + "]", new Font(Font.HELVETICA, 12, Font.BOLD)));
            } else {
                document.add(new Paragraph("(Da ky dien tu)                               (Cho ky so)", italicFont));
            }
            
            document.add(new Paragraph("                                              " + (user.getName() != null ? user.getName() : ""), normalFont));

            document.close();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            String safeModelName = vehicleModel.toUpperCase().replaceAll("\\s+", "_");
            headers.setContentDispositionFormData("attachment", "HD_DONG_SO_HUU_" + safeModelName + ".pdf");

            return new ResponseEntity<>(baos.toByteArray(), headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
